<template>
    <div class="story-section">
        <div class="story-card">
            <h2 class="fw-bold display-5 text-light">Our Story</h2>
            <p>
                Founded in 2025, Todo System was born out of a desire to simplify competences management for teams of
                all sizes. Our mission is to provide a seamless and intuitive platform that enhances learning at
                different scales.
            </p>
            <p>
                Over the months, we have grown from a small startup to a trusted solution for businesses worldwide. Our
                commitment to innovation and user-centric design has driven us to continuously improve our features and
                services.
            </p>
            <p>
                At Todo, we believe that effective competence management is the key to success. We are dedicated to
                helping teams improve and stay organized and keep learning everyday.
            </p>
        </div>

    </div>
</template>

<script>
export default {
    name: "Story",
};
</script>

<style scoped>
.story-section {

    margin: 0 auto;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    color: #fff;
    background: radial-gradient(circle at 70% 15%, rgba(0, 180, 255, 0.6), transparent 60%),
        radial-gradient(circle at 30% 65%, rgba(255, 0, 120, 0.5), transparent 60%),
        #000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    text-align: center;
}

.story-card {
    max-width: 800px;

    padding: 2rem;
    border-radius: 10px;

}
</style>