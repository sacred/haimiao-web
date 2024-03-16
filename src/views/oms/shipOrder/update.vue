<template>
  <cust-order-detail :isEdit="true"></cust-order-detail>
</template>
<script>
import ShipOrderDetail from './components/ShipOrderDetail'
export default {
  name: 'updateShipOrder',
  components: { ShipOrderDetail }
}
</script>
<style scoped>
</style>


