<template>
    <section class="team-section">
        <div class="container py-5">

            <div class="row mb-5 text-center">
                <div class="col-lg-8 mx-auto">
                    <h2 class="fw-bold display-5 text-dark">Our dedicated team</h2>
                    <p class="text-muted mt-3">
                        The people driving innovation and dedication behind our competence management platform.
                    </p>
                </div>
            </div>

            <div class="row g-4 justify-content-center">

                <!-- Team Member Card -->
                <div class="col-6 col-md-4 col-lg-3" v-for="member in teamMembers" :key="member.id">
                    <div class="team-card card h-100 border-0 shadow-sm text-center">
                        <div class="card-body p-4">
                            <img :src="member.avatar" :alt="member.name"
                                class="team-avatar mb-3 rounded-circle shadow-sm"
                                :style="{ 'border-color': member.color }"
                            />
                            <h5 class="fw-bold mb-1" :style="{ 'color': member.color }">{{ member.name }}</h5>
                            <p class="text-muted small mb-2">{{ member.title }}</p>
                            <p class="text-muted small">{{ member.bio }}</p>
                        </div>
                    </div>
                </div>

            </div>
            <div class="row mb-5 text-center">
                <div class="col-lg-8 mx-auto">
                    <p class="text-muted mt-3">
                        You want to enter the team or just contact us? Feel free to reach out via email at <a
                            href="mailto:toto@web.com">contact@todoweb.com</a>
                    </p>
                </div>
            </div>

        </div>
    </section>
</template>

<script>
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
                    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
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
                },
            ]
        }
    }
}
</script>

<style scoped>
.team-section {
    background-color: #f7f9ff;
    font-family: 'Inter', sans-serif;
}

.container {
    max-width: 1200px;
    padding: 0 30px;
}

.team-card {
    transition: transform 0.2s, box-shadow 0.2s;
    border-radius: 0.75rem;
}

.team-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.team-avatar {
    width: 90px;
    height: 90px;
    object-fit: cover;
    border: 3px solid; 
}
</style>
