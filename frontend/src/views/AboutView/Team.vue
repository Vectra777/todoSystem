<template>
  <section class="team-section" :class="{ 'dark-mode': isDark }">
    <div class="container py-5">
      <!-- Section header -->
      <div class="row mb-5 text-center">
        <div class="col-lg-8 mx-auto">
          <h2 class="fw-bold mb-3">Our dedicated team</h2>
          <p class="text-muted mb-5">
            The people driving innovation and dedication behind our competence management platform.
          </p>
        </div>
      </div>

      <!-- Team members -->
      <div class="row g-4 justify-content-center">
        <div
          class="col-6 col-md-4 col-lg-3"
          v-for="member in teamMembers"
          :key="member.id"
        >
          <div
            class="team-card card h-100 border-0 shadow-sm text-center"
            :style="{
              backgroundColor: isDark ? '#424242' : '#fff',
              color: isDark ? '#f1f1f1' : '#212529'
            }"
          >
            <div class="card-body p-4">
              <img
                :src="member.avatar"
                :alt="member.name"
                class="team-avatar mb-3 rounded-circle shadow-sm"
                :style="{ borderColor: member.color }"
              />
              <h5 class="fw-bold mb-1" :style="{ color: member.color }">{{ member.name }}</h5>
              <p class="text-muted small mb-2">{{ member.title }}</p>
              <p class="text-muted small">{{ member.bio }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact -->
      <div class="row mt-5 text-center">
        <div class="col-lg-8 mx-auto">
          <p class="text-muted mt-3">
            You want to enter the team or just contact us? Feel free to reach out via email at
            <a href="mailto:contact@todoweb.com" class="contact-link">
              contact@todoweb.com
            </a>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useThemeStore } from '../../stores/theme'
import { mapStores } from 'pinia'

export default {
  name: 'Team',
  data() {
    return {
      teamMembers: [
        {
          id: 1,
          name: 'Antoine Mroczko',
          title: 'Database Architect, API Designer',
          avatar: 'https://media.licdn.com/dms/image/v2/D4E03AQEMx8eZbEi44A/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1727008909101?e=1762992000&v=beta&t=mnriv8UvwSOYrq6JUbHOH8WnY42mal_gN2YO6pCWPuo',
          bio: 'Visionary leader focused on aligning HR tech with business strategy.',
          color: '#4f8cff'
        },
        {
          id: 2,
          name: 'Valentin Belougne',
          title: 'Authentication Specialist, UI/UX Developer',
          avatar: 'https://media.licdn.com/dms/image/v2/D4E03AQGMMnfTi_AciQ/profile-displayphoto-shrink_100_100/B4EZadOjN3H4AY-/0/1746394560378?e=1762992000&v=beta&t=r7rs-6jdJEcysoFD1aUjPPgqNvmCRR8X_AEcScgMuCI',
          bio: 'Expert in B2B authentification and user-friendly interfaces.',
          color: '#ff6ec4'
        },
        {
          id: 3,
          name: 'Alexis Demont',
          title: 'Frontend Developer, UI/UX Designer',
          avatar: 'https://media.licdn.com/dms/image/v2/D4E03AQGbI30widTPCQ/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1713363313539?e=1762992000&v=beta&t=Onn7SAjoE7L4SKBlQq_khD4ujtIYxOMt-kcdex4agro',
          bio: 'Expert in API integration and responsive design.',
          color: '#50fa7b'
        }
      ]
    }
  },
  computed: {
    ...mapStores(useThemeStore),
    isDark() {
      return this.themeStore.isDark
    }
  }
}
</script>

<style scoped>
.team-section {
  background-color: #f7f9ff;
  font-family: 'Inter', sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* --- Typographie cohérente --- */
h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #212529;
}

p {
  font-size: 1rem;
  color: #6c757d;
}

/* --- Lien de contact --- */
.contact-link {
  color: #0d6efd;
  text-decoration: none;
  font-weight: 500;
}

.contact-link:hover {
  text-decoration: underline;
}

/* --- Dark mode --- */
.dark-mode {
  background-color: #121212;
  color: #f1f1f1;
}

.dark-mode h2 {
  color: #ffffff;
}

.dark-mode p,
.dark-mode .text-muted {
  color: #cccccc !important;
}

.dark-mode .contact-link {
  color: #4f8cff;
}

/* --- Cartes --- */
.team-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 0.75rem;
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.team-avatar {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border: 3px solid;
}
</style>
