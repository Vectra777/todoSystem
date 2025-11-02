<template>
  <section class="comments-section position-relative" :class="{ 'dark-mode': isDark }">
    <div class="animated-bg">
      <div class="shape shape1"></div>
      <div class="shape shape2"></div>
      <div class="shape shape3"></div>
      <div class="shape shape4"></div>
    </div>

    <div class="container py-5 position-relative">
      <!-- Titre et paragraphe harmonisés -->
      <h2 class="fw-bold mb-3">Testimonials</h2>
      <p class="text-muted mb-5">
        Our solution has already been tested and approved by hundreds of companies.
      </p>

      <div class="row g-4 justify-content-center">
        <div
          class="col-md-6 col-lg-4"
          v-for="(comment, index) in comments"
          :key="comment.id"
          :class="{ 'mx-auto': index === comments.length - 1 && comments.length % 3 === 1 }"
        >
          <div
            class="card shadow-sm h-auto border-0 comment-card"
            :style="{
              backgroundColor: isDark ? '#424242' : '#fff',
              color: isDark ? '#f1f1f1' : '#212529'
            }"
          >
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <img
                  :src="comment.avatar"
                  :alt="comment.name"
                  class="avatar me-3 rounded-circle border border-3"
                  :style="{ borderColor: comment.color }"
                />
                <div>
                  <!-- Nom et rôle harmonisés -->
                  <span class="fw-bold" :style="{ color: comment.color }">{{ comment.name }}</span><br />
                  <span class="small text-muted">{{ comment.role }}</span>
                </div>
              </div>

              <p class="text-muted mb-0 mt-3">{{ comment.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useThemeStore } from '../../stores/theme';
import { mapStores } from 'pinia';

export default {
  name: 'Reviews',
  data() {
    return {
      comments: [
        {
          id: 1,
          name: 'Andi Antennae',
          role: 'HR Manager at BrightTech Solutions',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          text: 'This app completely transformed how we track employee skills. The progress dashboard is clear and motivates our teams.',
          color: '#4f8cff'
        },
        {
          id: 2,
          name: 'Sally Spiracle',
          role: 'Learning & Development Lead at Innovexa',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          text: 'Finally, a simple way to see both individual and group competencies. It’s saving us hours every week.',
          color: '#ff6ec4'
        },
        {
          id: 3,
          name: 'Dev Doodlebug',
          role: 'Talent Development Director at GlobalFin Corp',
          avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
          text: 'We used the app to identify skill gaps and launch targeted training. The results were immediate.',
          color: '#99eb99'
        },
        {
          id: 4,
          name: 'Wanda Wingleton',
          role: 'Operations Manager at Nexora Systems',
          avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
          text: 'As a manager, I love being able to set deadlines and monitor progress in real time. Very efficient.',
          color: '#ffb8c4'
        },
        {
          id: 5,
          name: 'Carl Caterpillar',
          role: 'Training Coordinator at AlphaCore Industries',
          avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
          text: 'Notifications and reminders keep our employees on track. Engagement has improved significantly.',
          color: '#a980ff'
        },
        {
          id: 6,
          name: 'Ciara Chrysalis',
          role: 'HR Business Partner at FutureWave Technologies',
          avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
          text: 'The reporting tools are excellent. Exporting skill progress reports makes management meetings so much easier.',
          color: '#f8d070'
        },
        {
          id: 7,
          name: 'Sophia Segment',
          role: 'Chief People Officer at Horizon Group',
          avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
          text: 'A must-have tool for any company serious about employee development and learning culture.',
          color: '#615546'
        }
      ]
    }
  },
  computed: {
    ...mapStores(useThemeStore),
    isDark() {
      return this.themeStore.isDark;
    }
  }
}
</script>

<style scoped>
.avatar {
  width: 55px;
  height: 55px;
  object-fit: cover;
}

/* --- Harmonisation typographique --- */
h2 {
  font-weight: 700;
  font-size: 1.75rem;
  color: #212529;
}

p {
  font-size: 1rem;
  color: #6c757d;
}

/* Mode sombre */
.dark-mode h2 {
  color: #ffffff;
}

.dark-mode p,
.dark-mode .text-muted {
  color: #cccccc !important;
}

/* --- Animation et décor --- */
.animated-bg .shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.4;
  filter: blur(20px);
  animation: float 6s infinite ease-in-out;
}

.shape1 {
  z-index: 0;
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #4f8cff, #ff6ec4);
  top: -60px;
  left: -80px;
}

.shape2 {
  width: 180px;
  height: 180px;
  background: linear-gradient(135deg, #ffb8c4, #99eb99);
  bottom: 80px;
  right: 40px;
}

.shape3 {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #a980ff, #f8d070);
  top: 100px;
  right: 120px;
}

.shape4 {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #ff6ec4, #4f8cff);
  bottom: 150px;
  left: 100px;
}

@keyframes float {
  0% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-80px) scale(1.2);
  }

  100% {
    transform: translateY(0) scale(1);
  }
}
</style>
