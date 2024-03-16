<template>
  <cust-order-detail :isEdit="false"></cust-order-detail>
</template>
<script>
import ShipOrderDetail from './components/ShipOrderDetail'
export default {
  name: 'addShipOrder',
  components: { ShipOrderDetail }
}
</script>
<style scoped>
</style>


