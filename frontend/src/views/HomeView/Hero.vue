<template>
  <div class="first-section text-center text-white p-5">
    <h1>Welcome to <b>ToDo</b></h1>
    <div id="typewriter"></div>
    <div class="connection-badge d-inline-block mt-3">Log In</div>
  </div>
</template>

<script>
export default {
  name: "HomeView",
  data() {
    return {
      typewriterText: 'Plan and control the competences of your team in real time. Human ressources will love it.',
      index: 0,
      writing: true,
      typewriterTimer: null,
      typewriterActive: true,
      typingSpeed: 50
    };
  },
  mounted() {
    this.startTypewriter();
  },
  beforeUnmount() {
    this.typewriterActive = false;
    if (this.typewriterTimer) cancelAnimationFrame(this.typewriterTimer);
  },
  methods: {
    startTypewriter() {
      const element = document.getElementById('typewriter');
      const animate = () => {
        if (!this.typewriterActive) return;

        if (this.writing) {
          this.index++;
          if (this.index > this.typewriterText.length) {
            this.writing = false;
            this.typewriterTimer = setTimeout(() => requestAnimationFrame(animate), 2000);
            return;
          }
        } else {
          this.index--;
          if (this.index < 0) {
            this.writing = true;
            this.index = 0;
            this.typewriterTimer = setTimeout(() => requestAnimationFrame(animate), 1000);
            return;
          }
        }

        if (element) {
          element.innerHTML = `<span>${this.typewriterText.slice(0, this.index)}|</span><span style="opacity:0">${this.typewriterText.slice(this.index)}</span>`;
        }

        this.typewriterTimer = setTimeout(() => requestAnimationFrame(animate), this.writing ? this.typingSpeed : this.typingSpeed / 2);
      };

      requestAnimationFrame(animate);
    }
  }
};
</script>

<style scoped>
.first-section {
  background: radial-gradient(circle at 70% 15%, rgba(0, 180, 255, 0.6), transparent 60%),
    radial-gradient(circle at 30% 65%, rgba(255, 0, 120, 0.5), transparent 60%),
    #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 4.5rem;
  margin-bottom: 1rem;
}

#typewriter {
  font-size: 1.8rem;
  max-width: 800px;
  margin: 0 auto 1.5rem auto;
  line-height: 1.5;
}

.connection-badge {
  color: #fff;
  font-size: 2rem;
  padding: 0.5rem 1.5rem;
  border-radius: 50rem;
  border: 2px solid #fff;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
}

.connection-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #4f8cff, #ff6ec4);
  z-index: -1;
  transform: translateX(-100%);
  transition: transform 0.5s ease-in-out;
}

.connection-badge:hover::before {
  transform: translateX(0);
}

.connection-badge:hover {
  transform: scale(1.05);
}
</style>
