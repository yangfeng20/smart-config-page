<template>
  <div>

    <div class="common-layout">
      <el-container>
        <el-header>
          <el-link class="my-link" :underline="false" target="_blank" href="https://github.com/yangfeng20/">
            <el-avatar :size="25" src="https://github.githubassets.com/favicons/favicon.png"/>
            &nbsp;&nbsp;Smart Config
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </el-link>
          <el-link class="my-link" :underline="false" target="_blank" href="https://github.com/yangfeng20/">
            <el-icon>
              <InfoFilled/>
            </el-icon>
            帮助
          </el-link>
        </el-header>
        <el-container>
          <el-aside width="0">预留位置</el-aside>
          <el-container>
            <el-main>
              <div style="margin-bottom: 10px;text-align: right">
                <el-button type="success" @click="doReleaseConfig">{{ t('config.releaseConfig') }}</el-button>
                <el-button type="warning" @click="showEditValue(null,null,null)">{{ t('config.addConfig') }}</el-button>
              </div>
              <el-table
                  border
                  :data="configList"
                  style="width: 100%"
                  @cell-click="showTableVal"
                  :cell-class-name="tableColClassName"
                  :row-class-name="tableRowClassName">
                <el-table-column prop="status" :label="t('config.row.status')" align="center" width="140">
                  <template v-slot="{ row }">
                    <div
                        :class="row.status === '未发布' ? 'status un-release-status' : row.status === '已发布' ? 'status release-status' : ''">
                      {{ row.status }}
                    </div>
                  </template>
                </el-table-column>
                <el-table-column class="opt-icon" prop="key" :label="t('config.row.key')" width="290">
                  <template v-slot="{ row }">
                    <div>
                      {{ row.key }}
                      <span v-if="row.durable==='false'">
              <el-tag effect="dark" type="warning" size="small"><el-icon><WarningFilled/></el-icon>{{
                  t('config.notDurable')
                }}</el-tag>
            </span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column class="opt-icon" prop="value" :label="t('config.row.value')" width="450"/>
                <el-table-column class="my-col" prop="desc" :label="t('config.row.desc')" width="180"/>
                <el-table-column prop="createDate" :label="t('config.row.createDate')" width="170"/>
                <el-table-column prop="updateDate" :label="t('config.row.updateDate')" width="170"/>
                <el-table-column prop="opt" :label="t('config.row.opt')" width="80">
                  <el-button type="success" :icon="Edit" circle/>
                </el-table-column>
              </el-table>
            </el-main>
            <el-footer>
              <div style="text-align: center">
                <el-link class="my-link" :underline="false" target="_blank" href="https://github.com/yangfeng20/">
                  <el-avatar :size="20" src="https://github.githubassets.com/favicons/favicon.png"/>
                  &nbsp;&nbsp;Smart Config
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </el-link>
              </div>
            </el-footer>
          </el-container>
        </el-container>
      </el-container>
    </div>


    <!--预览key获取value弹窗-->
    <el-dialog
        class="dialog-div"
        :title="t('config.viewTitle')"
        v-model="valueVisible"
        width="60%">
      <div class="view-value">{{ viewValue }}</div>
    </el-dialog>

    <!--修改新增配置弹窗-->
    <el-dialog
        class="dialog-div"
        :title="t('config.editViewTitle')"
        v-model="editValueVisible"
        width="60%">
      <div class="edit-container">
        <div>
          Key &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <el-input
              v-model="editViewKey"
              style="width: 80%"
              :disabled="editViewKeyDisable"
              placeholder="Config Key"
          />
        </div>
        <div>
          Value&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <el-input
              v-model="editViewValue"
              style="width: 80%"
              :autosize="{ minRows: 3, maxRows: 2000 }"
              type="textarea"
              placeholder="Config Value"/>
        </div>
        <div>
          Comment&nbsp;&nbsp;
          <el-input
              v-model="editViewComment"
              style="width: 80%"
              :autosize="{ minRows: 2, maxRows: 10 }"
              type="textarea"
              placeholder="Comment"
          />
        </div>
      </div>
      <el-divider></el-divider>
      <div slot="footer" class="dialog-footer" style="display: flex; justify-content: flex-end;">
        <el-button size="small" @click="editValueVisible = false;">取 消</el-button>
        <el-button size="small" type="primary" @click="doEditConfig">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import {ref, getCurrentInstance } from 'vue';
const instance = getCurrentInstance();
import axios from "./../axios";
// 导入t函数
import {useI18n} from "vue-i18n";
import {Edit, WarningFilled, InfoFilled} from '@element-plus/icons-vue'
import {ElNotification} from "element-plus";

// data
const valueVisible = ref(false);
const viewValue = ref("");

const editValueVisible = ref(false);
const editViewValue = ref("");
const editViewComment = ref("");
const editViewKey = ref("")
const editViewKeyDisable = ref(false)


// methods
const {t} = useI18n();
const showTableVal = (row, col, cell, event) => {
  let colKey = col.property;

  // key || value 预览
  if ("key" === colKey || "value" === colKey) {
    // 解析 JSON 字符串为 JavaScript 对象
    try {
      const jsonObject = JSON.parse(row[col.property]);
      // 通过 JSON.stringify 来格式化 JSON 字符串，第三个参数用于指定缩进字符
      viewValue.value = JSON.stringify(jsonObject, null, 2);
    } catch (e) {
      console.log("not json")
      viewValue.value = row[col.property]
    }
    valueVisible.value = true
    return;
  }

  // 编辑value
  if ("opt" === colKey) {
    let configKey = row.key
    let configValue = row.value
    let comment = row.desc
    showEditValue(configKey, configValue, comment)
    return;
  }
}

const showEditValue = (configKey, configValue, comment) => {
  // 存在key，不允许更改
  editViewKeyDisable.value = !!configKey

  // 展示key，value，comment
  editViewKey.value = configKey
  editViewValue.value = configValue
  editViewComment.value = comment
  // 显示弹框
  editValueVisible.value = true
}

const doReleaseConfig = () => {
  ElNotification({
    title: t("config.releaseSuccessTitle"),
    type: 'success',
    duration: 1000,
  })
  axios.post("/release").then(resp => {
    let data = resp.data.data
    ElNotification({
      title: t("config.releaseSuccessTitle"),
      type: 'success',
      duration: 1000,
    })
  }).catch(e => {

  }).finally(() => {
    editValueVisible.value = false
  })
}

const doEditConfig = () => {
  axios.post("/save", {
    configKey: editViewKey.value,
    configValue: editViewValue.value,
    desc: editViewComment.value,
  }).then(resp => {
    let data = resp.data.data
  }).catch(e => {

  }).finally(() => {
    editValueVisible.value = false
  })

}

const tableColClassName = ({row, column, rowIndex, columnIndex}) => {
  if (columnIndex === 1 || columnIndex === 2) {
    return "opt-icon"
  }
  if (columnIndex === 3) {
    return "my-col"
  }
  if (columnIndex === 4 || columnIndex === 5) {
    return "date-col"
  }
  return ''
}
const tableRowClassName = ({row, rowIndex}) => {
  const cycleIndex = rowIndex % 5; // 使用取模运算符获取循环索引
  if (cycleIndex === 0) {
    return 'warning-row';
  } else if (cycleIndex === 1) {
    return 'success-row';
  } else if (cycleIndex === 2) {
    return 'info-row';
  } else if (cycleIndex === 3) {
    return 'primary-row';
  } else if (cycleIndex === 4) {
    return 'danger-row';
  }
  return '';
}

</script>

<script>
export default {
  name: "ConfigList",
  created() {
  },
  methods: {},
  data() {
    return {
      configList: [
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "hahhahafowiefjow灰色调峰叫我我偶尔峰叫我也放假噢威海市金佛微积分我的饭就偶尔hahhahafowiefjow灰色调峰叫我我偶尔峰叫我也放假噢威海市金佛微积分我的饭就偶尔hahhahafowiefjow灰色调峰叫我我偶尔峰叫我也放假噢威海市金佛微积分我的饭就偶尔hahhahafowiefjow灰色调峰叫我我偶尔峰叫我也放假噢威海市金佛微积分我的饭就偶尔hahhahafowiefjow灰色调峰叫我我偶尔峰叫我也放假噢威海市金佛微积分我的饭就偶尔",
          "durable": "false",
          "key": "ccc",
          "status": "已发布",
          "value": "333"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "logging.level.com.maple.config.core",
          "status": "已发布",
          "value": "debug"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "prod",
          "status": "已发布",
          "value": "{\n" +
              "  \"jobStatId\": 43,\n" +
              "  \"callJobId\": 12,\n" +
              "  \"companyId\": 72,\n" +
              "  \"totalCount\": 26,\n" +
              "  \"totalTime\": 84,\n" +
              "  \"doneCount\": 98,\n" +
              "  \"calledCount\": 78,\n" +
              "  \"rejectedCount\": 65,\n" +
              "  \"unavailableCount\": 3,\n" +
              "  \"fromUnavailableCount\": 74,\n" +
              "  \"blankCount\": 15,\n" +
              "  \"closedCount\": 68,\n" +
              "  \"busyCount\": 94,\n" +
              "  \"downCount\": 53,\n" +
              "  \"missCount\": 81,\n" +
              "  \"overdueCount\": 33,\n" +
              "  \"blacklistCount\": 88,\n" +
              "  \"tiandunBlockCount\": 36,\n" +
              "  \"blindCount\": 62,\n" +
              "  \"lostCount\": 65,\n" +
              "  \"userHangUpCount\": 57,\n" +
              "  \"aiHangUpCount\": 14,\n" +
              "  \"transferSuccess\": 67,\n" +
              "  \"transferTotal\": 40,\n" +
              "  \"noAvailableLineCount\": 13,\n" +
              "  \"gmtCreate\": \"2017-10-13 09:07:56\",\n" +
              "  \"gmtModified\": \"2015-03-25 15:23:35\",\n" +
              "  \"customerCount\": 69,\n" +
              "  \"callCount\": 4,\n" +
              "  \"linePeriodCount\": 12,\n" +
              "  \"aiSeatBillPeriodCount\": 87,\n" +
              "  \"overTwoChatRoundCount\": 90,\n" +
              "  \"dialogueRoundsJson\": \"test_3f572fa06023\",\n" +
              "  \"callDurationJson\": \"test_a8d7d0928485\"\n" +
              "}"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "smart.username",
          "status": "已发布",
          "value": "admin"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "main.test02",
          "status": "已发布",
          "value": "{\"admin\":\"123456\",\"test\":\"bbbb\"}"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "spring.application.name",
          "status": "未发布",
          "value": "smart-test"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "env",
          "status": "未发布",
          "value": "prod"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "smart.password",
          "status": "已发布",
          "value": "admin"
        }, {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "ccc",
          "status": "已发布",
          "value": "333"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "logging.level.com.maple.config.core",
          "status": "已发布",
          "value": "debug"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "prod",
          "status": "已发布",
          "value": "false"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "smart.username",
          "status": "已发布",
          "value": "admin"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "main.test02",
          "status": "已发布",
          "value": "{\"admin\":\"123456\",\"test\":\"bbbb\"}"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "spring.application.name",
          "status": "未发布",
          "value": "smart-test"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "env",
          "status": "未发布",
          "value": "prod"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "smart.password",
          "status": "已发布",
          "value": "admin"
        }, {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "ccc",
          "status": "已发布",
          "value": "333"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "logging.level.com.maple.config.core",
          "status": "已发布",
          "value": "debug"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "prod",
          "status": "已发布",
          "value": "false"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "smart.username",
          "status": "已发布",
          "value": "admin"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "main.test02",
          "status": "已发布",
          "value": "{\"admin\":\"123456\",\"test\":\"bbbb\"}"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "spring.application.name",
          "status": "未发布",
          "value": "smart-test"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "env",
          "status": "未发布",
          "value": "prod"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "smart.password",
          "status": "已发布",
          "value": "admin"
        }, {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "ccc",
          "status": "已发布",
          "value": "333"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "logging.level.com.maple.config.core",
          "status": "已发布",
          "value": "debug"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "prod",
          "status": "已发布",
          "value": "false"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "smart.username",
          "status": "已发布",
          "value": "admin"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "main.test02",
          "status": "已发布",
          "value": "{\"admin\":\"123456\",\"test\":\"bbbb\"}"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "spring.application.name",
          "status": "未发布",
          "value": "smart-test"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "env",
          "status": "未发布",
          "value": "prod"
        },
        {
          "createDate": "2024-03-27 17:20:02",
          "desc": "",
          "durable": "true",
          "key": "smart.password",
          "status": "已发布",
          "value": "admin"
        },
      ]
    }
  }
}
</script>

<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}


.el-table .info-row {
  --el-table-tr-bg-color: var(--el-color-info-light-9);
}

.el-table .danger-row {
  --el-table-tr-bg-color: var(--el-color-danger-light-9);
}

.el-table .primary-row {
  --el-table-tr-bg-color: var(--el-color-primary-light-9);
}

/*鼠标悬停文章效果*/
.opt-icon {
  cursor: pointer;
}

.opt-icon :first-child {
  max-height: 150px;
}

.my-col :first-child {
  max-height: 150px;
}


.dialog-div .el-dialog__body {
  font-size: var(--el-dialog-content-font-size);
  word-break: break-all;
  color: #333333;
  background-color: #f5f5f5;
  padding: 20px;
}

.el-dialog__body {
  color: #333333;
  background-color: #f5f5f5;
}

.status {
  color: #ffffff;
  display: inline-block;
  max-width: 80%;
  padding-left: 10px;
  padding-right: 10px;
}

.data-col .cell {
  color: rgb(121, 121, 121);
  font-size: 13px;
}

.un-release-status {
  background-color: #f0ad4e;
}

.release-status {
  background-color: #a4a4a4;
}

.edit-container {
  display: flex;
  flex-direction: column;
}

.edit-container > div {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.edit-container > div > span {
  min-width: 100px; /* 设置文本的最小宽度 */
  margin-right: 10px; /* 设置文本和输入框之间的间距 */
}

.my-link {
  margin: 15px;
}
</style>