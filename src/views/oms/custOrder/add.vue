<template>
  <cust-order-detail :isEdit="false"></cust-order-detail>
</template>
<script>
import CustOrderDetail from './components/CustOrderDetail'
export default {
  name: 'addCustOrder',
  components: { CustOrderDetail }
}
</script>
<style scoped>
</style>


