<template>
  <Header />
  <Hero />
  <Features />
  <Reviews />
  <Footer />
</template>

<script>
import Header from '../../components/Header.vue';
import Footer from '../../components/Footer.vue';
import Hero from './Hero.vue';
import Features from './Features.vue';
import Reviews from './Reviews.vue';
export default {
  name: 'Home',
  components: {
    Header,
    Footer,
    Hero,
    Features,
    Reviews
  },
}
</script>

<style></style>