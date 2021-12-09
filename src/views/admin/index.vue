<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="Title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
    </div>
    <br>
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" width="50" prop="id" sortable="custom" align="center" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="头像" align="center">
        <template slot-scope="{row}">
          <span>{{ row.avatar }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" align="center">
        <template slot-scope="{row}">
          <span>{{ row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column label="昵称">
        <template slot-scope="{row}">
          <span>{{ row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色">
        <template slot-scope="{row}">
          <span>{{ row.nickname }}</span>
        </template>
      </el-table-column>
      <el-table-column label="电话">
        <template slot-scope="{row}">
          <span>{{ row.mobile }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮件">
        <template slot-scope="{row}">
          <el-tag>{{ row.email }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status|statusFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="添加时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center">
        <template slot-scope="{row}">
          <span>{{ row.updated_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="头像" prop="avatar">
          <el-input v-model="temp.avatar" />
        </el-form-item>
        <!-- <el-form-item label="角色" prop="type">
          <el-select v-model="temp.type" class="filter-item" placeholder="Please select">
            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="账号" prop="usernam">
          <el-input v-model="temp.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="temp.nickname" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="temp.password" />
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="temp.mobile" />
        </el-form-item>
        <el-form-item label="邮件" prop="email">
          <el-input v-model="temp.email" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio v-model="temp.status" label="0" border size="medium">禁用</el-radio>
          <el-radio v-model="temp.status" label="1" border size="medium">启用</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import admin from '@/api/admin'
export default {
  name: 'ComplexTable',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: '禁用',
        1: '启用'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: '+id'
      },
      statusOptions: ['禁用', '正常'],
      temp: {
        id: undefined,
        avatar: '',
        role_id: [],
        username: '',
        nickname: '',
        mobile: '',
        emial: '',
        status: '0',
        timestamp: new Date()
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      dialogPvVisible: true,
      pvData: [],
      rules: {
        username: [{ required: true, message: '用户名是必须的', trigger: 'blur' }],
        nickname: [{ required: true, message: '昵称是必须的', trigger: 'change' }],
        password: [{ required: true, message: '密码是必须的', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      admin.getList(this.listQuery).then(res => {
        this.list = res.data
        this.total = res.total
        this.listQuery.page = res.current_page
        this.listLoading = false
      }).catch(err => {
        this.$message.error(err.message)
        setTimeout(() => {
          this.listLoading = false
        }, 2000)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        avatar: '',
        role_id: [],
        username: '',
        nickname: '',
        mobile: '',
        emial: '',
        status: '1'
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          admin.addAdmin(this.temp).then(res => {
            console.log(res)
            this.dialogFormVisible = false
            this.getList()
          }).catch((err) => {
            this.$message.error(err.message)
            setTimeout(() => {
              this.listLoading = false
            }, 2000)
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          admin.upAdmin(this.temp).then(res => {
            console.log(res)
            this.dialogFormVisible = false
            this.getList()
          }).catch((err) => {
            this.$message.error(err.message)
            setTimeout(() => {
              this.listLoading = false
            }, 2000)
          })
        }
      })
    },
    handleDelete(row, index) {
      admin.delAdmin(row.id).then(res => {
        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
        this.list.splice(index, 1)
      }).catch(err => {
        console.log(err)
        setTimeout(() => {
          this.$message.error(err.message[0])
        }, 2000)
      })
    },

    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}

</script>
<style scoped>
</style>
