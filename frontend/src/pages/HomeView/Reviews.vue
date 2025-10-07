<template>
  <section class="comments-section position-relative">
    <div class="animated-bg">
      <div class="shape shape1"></div>
      <div class="shape shape2"></div>
      <div class="shape shape3"></div>
      <div class="shape shape4"></div>
    </div>

    <div class="container py-5 position-relative">
      <h2 class="mb-4 fw-bold fs-2 text-dark">Testimonials</h2>
      <p class="mb-5 fw-normal text-muted">Our solution has already been tested and approved by hundreds of companies.
      </p>

      <div class="row g-4 justify-content-center">
        <div class="col-md-6 col-lg-4" v-for="(comment, index) in comments" :key="comment.id" :class="{
          'mx-auto': index === comments.length - 1 && comments.length % 3 === 1
        }">
          <div class="comment-card card border-0 position-relative shadow-sm h-auto">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <img :src="comment.avatar" :alt="comment.name" class="avatar me-3 rounded-circle border border-3"
                  :style="{ 'border-color': comment.color + ' !important' }" />
                <div>
                  <span class="fw-bold" :style="{ 'color': comment.color }">{{ comment.name }}</span><br>
                  <span class="text-secondary small fw-normal">{{ comment.role }}</span>
                </div>
              </div>

              <p class="mb-0 text-body mt-3">{{ comment.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
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
          date: 'Sep 10, 2025',
          color: '#4f8cff' // Bleu
        },
        {
          id: 2,
          name: 'Sally Spiracle',
          role: 'Learning & Development Lead at Innovexa',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          text: 'Finally, a simple way to see both individual and group competencies. It’s saving us hours every week.',
          date: 'Sep 11, 2025',
          color: '#ff6ec4' // Rose
        },
        {
          id: 3,
          name: 'Dev Doodlebug',
          role: 'Talent Development Director at GlobalFin Corp',
          avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
          text: 'We used the app to identify skill gaps and launch targeted training. The results were immediate.',
          date: 'Sep 12, 2025',
          color: '#99eb99' // Vert clair
        },
        {
          id: 4,
          name: 'Wanda Wingleton',
          role: 'Operations Manager at Nexora Systems',
          avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
          text: 'As a manager, I love being able to set deadlines and monitor progress in real time. Very efficient.',
          date: 'Sep 12, 2025',
          color: '#ffb8c4'
        },
        {
          id: 5,
          name: 'Carl Caterpillar',
          role: 'Training Coordinator at AlphaCore Industries',
          avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
          text: 'Notifications and reminders keep our employees on track. Engagement has improved significantly.',
          date: 'Sep 13, 2025',
          color: '#a980ff'
        },
        {
          id: 6,
          name: 'Ciara Chrysalis',
          role: 'HR Business Partner at FutureWave Technologies',
          avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
          text: 'The reporting tools are excellent. Exporting skill progress reports makes management meetings so much easier.',
          date: 'Sep 18, 2025',
          color: '#f8d070'
        },
        {
          id: 7,
          name: 'Sophia Segment',
          role: 'Chief People Officer at Horizon Group',
          avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
          text: 'A must-have tool for any company serious about employee development and learning culture.',
          date: 'Sep 2, 2025',
          color: '#615546'
        }
      ]
    }
  },
}
</script>

<style scoped>
.comments-section {
  background: #fdf6f7;
  overflow: hidden;
}

.comment-card {
  border-radius: 0.8rem;
  background: #ffffff;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s, transform 0.2s;
  z-index: 1;
}

.comment-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px) scale(1.01);
}


.card-glass {
  opacity: 0;
}

.avatar {
  width: 55px;
  height: 55px;
  object-fit: cover;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;
  filter: blur(20px);
  animation: float 10s infinite ease-in-out;
}

.shape1 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #4f8cff, #ff6ec4);
  top: -60px;
  left: -80px;
  animation-delay: 0s;
}

.shape2 {
  width: 180px;
  height: 180px;
  background: linear-gradient(135deg, #ffb8c4, #99eb99);
  bottom: 80px;
  right: 40px;
  animation-delay: 2s;
}

.shape3 {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #a980ff, #f8d070);
  top: 100px;
  right: 120px;
  animation-delay: 4s;
}

.shape4 {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #ff6ec4, #4f8cff);
  bottom: 150px;
  left: 100px;
  animation-delay: 6s;
}

@keyframes float {
  0% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-100px) scale(1.1);
  }

  100% {
    transform: translateY(200) scale(1);
  }
}
</style>
