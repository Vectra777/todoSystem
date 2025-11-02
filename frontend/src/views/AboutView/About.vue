<template>
    <Header />

    <Story />



    <Team />
    <Footer />
</template>

<script>
import Footer from '../../components/Footer.vue';
import Header from '../../components/Header.vue';
import Story from './Story.vue';
import Team from './Team.vue';

export default {
    name: 'About',
    components: {
        Header,
        Footer,
        Story,
        Team
    },
}
</script>

<style scoped></style>