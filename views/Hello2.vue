<template lang="jade">
    div
        p {{ greeting }} world!
</template>

<script>
    export default {
        data (){
            return {
                greeting: 'Hello'
            }
        },
        components: {}
    }
</script>

