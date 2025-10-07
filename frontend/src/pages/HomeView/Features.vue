<template>
  <div class="container py-5">
    <h2 class="fw-bold mb-3">Outstanding features</h2>
    <p class="text-muted mb-5">An incredible bundle of tools to manage your teams competences more efficiently.</p>

    <div class="row g-4">
      <div 
        :class="{'col-md-6': index < 2, 'col-12': index === 2}" 
        v-for="(feature, index) in features" 
        :key="index"
      >
        <div class="card h-100 feature-card p-3 border-0 shadow-lg">
          <div 
            class="feature-image mb-3" 
            :style="{ 'background-color': feature.bgColor, 'height': feature.height, 'border-radius': '0.75rem' }"
            @click="zoomImage(feature.imgSrc, feature.title)"
          >
            <img :src="feature.imgSrc" :alt="feature.title" style="cursor: pointer;" />
          </div>
          <h5 class="fw-bold">{{ feature.title }}</h5>
          <p class="text-muted mb-0">{{ feature.description }}</p>
        </div>
      </div>
    </div>
    
    <!-- Image Zoom Modal -->
    <div v-if="isZoomed" class="image-zoom-overlay" @click="closeZoom">
      <div class="image-zoom-content" @click.stop>
        <img :src="zoomedImage.url" :alt="zoomedImage.name" class="img-fluid zoomed-image" />
        <button class="close-btn" @click="closeZoom">
            &times;
        </button>
        <div class="image-caption">{{ zoomedImage.name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "FeaturesSection",
  data() {
    return {
      features: [
        {
          title: 'Create competences',
          description: 'Create competences with deadlines, documents and labels.',
          bgColor: '#e5f5d5',
          height: '200px',
          imgSrc: 'https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/68450-Featured-News-Crad-01-416x179?resMode=sharp2&op_usm=1.5,0.65,15,0&wid=2000&hei=858&qlt=100&fit=constrain',
        },
        {
          title: 'Manage learning status',
          description: 'Employees can set status of their competences and get feedbacks from their human resources.',
          bgColor: '#e2e0ff',
          height: '200px',
          imgSrc: 'https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/68450-Featured-News-Crad-01-416x179?resMode=sharp2&op_usm=1.5,0.65,15,0&wid=2000&hei=858&qlt=100&fit=constrain',
        },
        {
          title: 'Control overall progression',
          description: 'HR can have a look at the overall progression at different scales: employee, teams and company. They can then adapt their workflow to meet the needs of the company.',
          bgColor: '#d6b28d',
          height: '300px',
          imgSrc: 'https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/68450-Featured-News-Crad-01-416x179?resMode=sharp2&op_usm=1.5,0.65,15,0&wid=2000&hei=858&qlt=100&fit=constrain',
        }
      ],
      isZoomed: false,
      zoomedImage: { url: '', name: '' }
    };
  },
  methods: {
    zoomImage(url, name) {
      this.zoomedImage = { url, name };
      this.isZoomed = true;
    },
    closeZoom() {
      this.isZoomed = false;
      this.zoomedImage = { url: '', name: '' };
    }
  }
};
</script>

<style scoped>
.feature-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.feature-image {
  width: 100%;
  display: block;
}

.feature-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.image-zoom-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050; 
}

.image-zoom-content {
    max-width: 90%;
    max-height: 90%;
    position: relative;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.7);
    border-radius: 0.5rem;
}

.zoomed-image {
    max-height: 80vh; 
    max-width: 100%;
    display: block;
    border-radius: 0.5rem;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 2rem;
    color: white;
    background: none;
    border: none;
    cursor: pointer;
    line-height: 1;
    z-index: 1051;
    opacity: 0.8;
    transition: opacity 0.2s;
}

.close-btn:hover {
    opacity: 1;
}

.image-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 10px 20px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    text-align: center;
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    font-size: 1.1rem;
    font-weight: bold;
}
</style>
