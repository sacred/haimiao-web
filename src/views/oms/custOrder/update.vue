<template>
  <cust-order-detail :isEdit="true"></cust-order-detail>
</template>
<script>
import CustOrderDetail from './components/CustOrderDetail'
export default {
  name: 'updateCustOrder',
  components: { CustOrderDetail }
}
</script>
<style scoped>
</style>

