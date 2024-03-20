<template>
  <ship-order-detail :isEdit="false"></ship-order-detail>
</template>
<script>
import ShipOrderDetail from './components/ShipOrderDetail'
export default {
  name: 'viewShipOrder',
  components: { ShipOrderDetail }
}
</script>
<style scoped>
</style>
