// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close mobile menu when clicking on a link
  document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  }));
}

// Page Navigation System
document.addEventListener('DOMContentLoaded', function() {
  // Get all pages
  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('.nav-link[data-page]');
  const footerLinks = document.querySelectorAll('footer .nav-link[data-page]');
  
  // Function to show a specific page
  function showPage(pageId) {
    // Hide all pages
    pages.forEach(page => {
      page.classList.remove('active');
    });
    
    // Show the selected page
    const activePage = document.getElementById(`${pageId}-page`);
    if (activePage) {
      activePage.classList.add('active');
    }
    
    // Update URL hash
    window.location.hash = pageId;
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Update active nav link
    updateActiveNavLink(pageId);
  }
  
  // Function to update active navigation link
  function updateActiveNavLink(pageId) {
    const allLinks = document.querySelectorAll('.nav-link[data-page]');
    allLinks.forEach(link => {
      if (link.getAttribute('data-page') === pageId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  // Add click event listeners to navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const pageId = this.getAttribute('data-page');
      showPage(pageId);
    });
  });
  
  // Add click event listeners to footer links
  footerLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const pageId = this.getAttribute('data-page');
      showPage(pageId);
    });
  });
  
  // Check URL hash on page load
  function checkHash() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(`${hash}-page`)) {
      showPage(hash);
    } else {
      showPage('home');
    }
  }
  
  // Initialize page based on URL hash
  checkHash();
  
  // Listen for hash changes
  window.addEventListener('hashchange', checkHash);
  
  // Make showPage globally accessible
  window.showPage = showPage;
});

// Simple animation on scroll
function animateOnScroll() {
  const elements = document.querySelectorAll('.step, .category-card, .info-card, .mv-card, .team-member');
  
  elements.forEach(element => {
    const elementPosition = element.getBoundingClientRect().top;
    const screenPosition = window.innerHeight / 1.3;
    
    if (elementPosition < screenPosition) {
      element.style.opacity = 1;
      element.style.transform = 'translateY(0)';
    }
  });
}
// Function to navigate to specific pages
function navigateToPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the target page
    document.getElementById(`${pageId}-page`).classList.add('active');
    
    // Update URL hash
    window.location.hash = pageId;
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function checkIfUserIsLoggedIn() {
    
    return localStorage.getItem('userLoggedIn') === 'true';
}

// Set up event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Contact Us button in hero section
    const contactBtn = document.querySelector('.hero-buttons .btn-primary');
    if (contactBtn) {
        contactBtn.addEventListener('click', function() {
            navigateToPage('contact');
        });
    }
    
    // Learn More button in hero section
    const learnMoreBtn = document.querySelector('.hero-buttons .btn-secondary');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            navigateToPage('pricing');
        });
    }
    
    // Get Started Today button in CTA section
    const getStartedBtn = document.querySelector('.cta .btn-primary');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', function() {
            if (checkIfUserIsLoggedIn()) {
                alert('You are already logged in. Enjoy all features!');
            } else {
                navigateToPage('login');
            }
        });
    }
    
    // Contact Support link in FAQ section
    const contactSupportBtn = document.querySelector('.faq-contact .btn-primary');
    if (contactSupportBtn) {
        contactSupportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            navigateToPage('contact');
        });
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            navigateToPage(hash);
        }
    });
    
    // Check if there's a hash in URL on page load
    if (window.location.hash) {
        const page = window.location.hash.substring(1);
        navigateToPage(page);
    }
});

// Initialize elements for animation
document.querySelectorAll('.step, .category-card, .info-card, .mv-card, .team-member').forEach(element => {
  element.style.opacity = 0;
  element.style.transform = 'translateY(20px)';
  element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

// Listen for scroll events
window.addEventListener('scroll', animateOnScroll);
// Initial check on page load
window.addEventListener('load', animateOnScroll);

// Earnings Calculator Functionality
document.addEventListener('DOMContentLoaded', function() {
  const calculateBtn = document.getElementById('calculate-btn');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', calculateEarnings);
  }
});

function calculateEarnings() {
  const wasteType = document.getElementById('waste-type').value;
  const weight = parseFloat(document.getElementById('weight').value);
  
  if (isNaN(weight) || weight <= 0) {
    alert('Please enter a valid weight');
    return;
  }
  
  // Define rate ranges for each waste type
  const rates = {
    'biodegradable': { min: 5, max: 10 },
    'non-biodegradable': { min: 8, max: 15 },
    'organic': { min: 4, max: 8 },
    'e-waste': { min: 20, max: 50 },
    'metal': { min: 15, max: 30 }
  };
  
  // Calculate estimated earnings (using average of min and max)
  const rate = (rates[wasteType].min + rates[wasteType].max) / 2;
  const earnings = weight * rate;
  
  // Display result
  const resultElement = document.querySelector('.result-amount');
  if (resultElement) {
    resultElement.textContent = `₹${earnings.toFixed(2)}`;
  }
}

// Animated counter for impact stats
document.addEventListener('DOMContentLoaded', function() {
  const statElements = document.querySelectorAll('.stat-number');
  
  function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      element.textContent = value.toLocaleString();
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
  
  function checkStatsVisibility() {
    const statsSection = document.querySelector('.impact-stats');
    if (!statsSection) return;
    
    const sectionPosition = statsSection.getBoundingClientRect().top;
    const screenPosition = window.innerHeight / 1.3;
    
    if (sectionPosition < screenPosition) {
      statElements.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        animateValue(stat, 0, target, 2000);
      });
      // Remove the event listener after animation triggers
      window.removeEventListener('scroll', checkStatsVisibility);
    }
  }
  
  if (statElements.length > 0) {
    window.addEventListener('scroll', checkStatsVisibility);
    // Check on initial load in case stats are already visible
    checkStatsVisibility();
  }
});

// Firebase Configuration and Initialization
const firebaseConfig = {
  apiKey: "",
  authDomain: "wastewealth-14e1e.firebaseapp.com",
  projectId: "wastewealth-14e1e",
  storageBucket: "wastewealth-14e1e.appspot.com",
  messagingSenderId: "382351360163",
  appId: "1:382351360163:web:3bdf861ff7fa6c3b23ff16"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Authentication State Observer - Modified to only change nav on login, not register
auth.onAuthStateChanged((user) => {
  if (user) {
    // Only show user profile if on login page or already logged in
    const currentHash = window.location.hash.substring(1);
    if (currentHash !== 'register') {
      showUserProfile(user);
      updateNavForLoggedInUser(user.displayName || user.email || "User");
    }
  } else {
    hideUserProfile();
    updateNavForLoggedOutUser();
  }
});

// Show Toast Notification
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
    <div class="toast-content">
      <div class="toast-title">${type === "success" ? "Success" : "Error"}</div>
      <div class="toast-message">${message}</div>
    </div>
  `;
  
  const container = document.querySelector(".toast-container") || createToastContainer();
  container.appendChild(toast);
  
  // Remove toast after animation completes
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement("div");
  container.className = "toast-container";
  document.body.appendChild(container);
  return container;
}

// Password Strength Checker
function checkPasswordStrength(password) {
  let strength = 0;
  const strengthText = document.querySelector(".strength-text span");
  const strengthFill = document.querySelector(".strength-fill");
  
  if (password.length >= 8) strength++;
  if (password.match(/[a-z]+/)) strength++;
  if (password.match(/[A-Z]+/)) strength++;
  if (password.match(/[0-9]+/)) strength++;
  if (password.match(/[!@#$%^&*(),.?":{}|<>]+/)) strength++;
  
  let strengthValue = "None";
  let strengthPercent = 0;
  let strengthColor = "#e74c3c";
  
  if (strength === 1) {
    strengthValue = "Weak";
    strengthPercent = 20;
    strengthColor = "#e74c3c";
  } else if (strength === 2) {
    strengthValue = "Fair";
    strengthPercent = 40;
    strengthColor = "#f39c12";
  } else if (strength === 3) {
    strengthValue = "Good";
    strengthPercent = 60;
    strengthColor = "#3498db";
  } else if (strength === 4) {
    strengthValue = "Strong";
    strengthPercent = 80;
    strengthColor = "#2ecc71";
  } else if (strength >= 5) {
    strengthValue = "Very Strong";
    strengthPercent = 100;
    strengthColor = "#27ae60";
  }
  
  if (strengthText && strengthFill) {
    strengthText.textContent = strengthValue;
    strengthFill.style.width = `${strengthPercent}%`;
    strengthFill.style.background = strengthColor;
  }
  
  return strength;
}

// Toggle Password Visibility
function setupPasswordToggles() {
  document.querySelectorAll(".password-toggle").forEach(toggle => {
    toggle.addEventListener("click", function() {
      const input = this.parentElement.querySelector("input");
      const icon = this.querySelector("i");
      
      if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  });
}

// Registration Form Handling - Fixed
function setupRegistrationForm() {
  const registerForm = document.getElementById("register-form");
  if (!registerForm) return;
  
  const passwordInput = document.getElementById("register-password");
  if (passwordInput) {
    passwordInput.addEventListener("input", function() {
      checkPasswordStrength(this.value);
    });
  }
  
  registerForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const phone = document.getElementById("register-phone").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm-password").value;
    const address = document.getElementById("register-address").value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    
    // Validate password strength
    if (checkPasswordStrength(password) < 3) {
      showToast("Please choose a stronger password", "error");
      return;
    }
    
    const submitButton = registerForm.querySelector(".auth-button");
    const originalText = submitButton.textContent;
    submitButton.classList.add("loading");
    submitButton.disabled = true;
    submitButton.textContent = "Creating Account...";
    
    try {
      // Create user with Firebase Auth
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update user profile with display name
      await user.updateProfile({
        displayName: name
      });
      
      // Save additional user data to Firestore
      await db.collection("users").doc(user.uid).set({
        name: name,
        email: email,
        phone: phone,
        address: address,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        walletBalance: 0,
        totalWasteRecycled: 0
      });
      
      console.log("User registered successfully:", user.uid);
      
      
emailjs.send("service_t5aolyf", "template_0r2e2zx", {
  email: email,
  to_name: name,
}).then(() => {
  console.log("Welcome email sent to user");
}).catch((err) => {
  console.error("Failed to send user email:", err);
});

// Send notification email to admin
emailjs.send("service_t5aolyf", "template_hna200m", {
  user_name: name,
  user_email: email,
  user_phone: phone,
  user_address: address
}).then(() => {
  console.log("Admin notified of new registration");
}).catch((err) => {
  console.error("Failed to send admin email:", err);
});

// Show success toast
showToast("Registration successful! Please check your email.");

      
      // Reset form
      registerForm.reset();
      
      // Clear password strength indicator
      const strengthText = document.querySelector(".strength-text span");
      const strengthFill = document.querySelector(".strength-fill");
      if (strengthText) strengthText.textContent = "None";
      if (strengthFill) {
        strengthFill.style.width = "0%";
        strengthFill.style.background = "#e74c3c";
      }
      
      // Sign out the user after showing success message
      setTimeout(() => {
        if (window.showPage) {
          window.showPage("login");
        }
      }, 1500);
      
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.code === "permission-denied" || error.message.includes("Missing or insufficient permissions")) {
        errorMessage = "Database permission error. Please check Firestore security rules.";
      } else if (error.code === "unavailable") {
        errorMessage = "Service temporarily unavailable. Please try again.";
      }
      
      showToast(errorMessage, "error");
    } finally {
      submitButton.classList.remove("loading");
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

// Login Form Handling - Fixed
function setupLoginForm() {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return;
  
  loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const rememberMe = document.getElementById("remember-me")?.checked || false;
    
    const submitButton = loginForm.querySelector(".auth-button");
    const originalText = submitButton.textContent;
    submitButton.classList.add("loading");
    submitButton.disabled = true;
    submitButton.textContent = "Logging in...";
    
    try {
      // Set persistence based on remember me selection
      const persistence = rememberMe ? 
        firebase.auth.Auth.Persistence.LOCAL : 
        firebase.auth.Auth.Persistence.SESSION;
      
      await auth.setPersistence(persistence);
      
      // Sign in with email and password
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update navigation for logged in user
      updateNavForLoggedInUser(user.displayName || user.email || "User");
      
      showToast(`Welcome back, ${user.displayName || user.email}! Login successful.`);
      
      // Reset form
      loginForm.reset();
      
      // Redirect to home after a short delay
      setTimeout(() => {
        if (window.showPage) {
          window.showPage("home");
        }
      }, 1500);
      
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      
      showToast(errorMessage, "error");
    } finally {
      submitButton.classList.remove("loading");
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

// Forgot Password Handling
function setupForgotPassword() {
  const forgotPasswordLink = document.getElementById("forgot-password-link");
  const forgotPasswordModal = document.getElementById("forgot-password-modal");
  const closeModalBtn = document.querySelector(".modal-close");
  const forgotPasswordForm = document.getElementById("forgot-password-form");
  
  if (forgotPasswordLink && forgotPasswordModal) {
    forgotPasswordLink.addEventListener("click", function(e) {
      e.preventDefault();
      forgotPasswordModal.classList.add("show");
    });
  }
  
  if (closeModalBtn && forgotPasswordModal) {
    closeModalBtn.addEventListener("click", function() {
      forgotPasswordModal.classList.remove("show");
    });
  }
  
  // Close modal when clicking outside
  if (forgotPasswordModal) {
    window.addEventListener("click", function(e) {
      if (e.target === forgotPasswordModal) {
        forgotPasswordModal.classList.remove("show");
      }
    });
  }
  
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async function(e) {
      e.preventDefault();
      
      const email = document.getElementById("reset-email").value;
      const submitButton = forgotPasswordForm.querySelector(".auth-button");
      const originalText = submitButton.textContent;
      
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
      
      try {
        await auth.sendPasswordResetEmail(email);
        showToast("Password reset email sent! Check your inbox.");
        if (forgotPasswordModal) {
          forgotPasswordModal.classList.remove("show");
        }
        forgotPasswordForm.reset();
      } catch (error) {
        console.error("Password reset error:", error);
        showToast("Failed to send reset email. Please try again.", "error");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  }
}

// User Profile Management
function showUserProfile(user) {
  console.log("User logged in:", user);
}

function hideUserProfile() {
  console.log("User logged out");
}

function updateNavForLoggedInUser(userName) {
  const registerItem = document.getElementById("register-item");
  const loginItem = document.getElementById("login-item");
  const userProfileItem = document.getElementById("user-profile-item");
  const userNameElement = document.getElementById("user-name");
  
  if (registerItem) registerItem.style.display = "none";
  if (loginItem) loginItem.style.display = "none";
  if (userProfileItem) userProfileItem.style.display = "list-item";
  if (userNameElement) userNameElement.textContent = userName;
}

function updateNavForLoggedOutUser() {
  const registerItem = document.getElementById("register-item");
  const loginItem = document.getElementById("login-item");
  const userProfileItem = document.getElementById("user-profile-item");
  
  if (registerItem) registerItem.style.display = "list-item";
  if (loginItem) loginItem.style.display = "list-item";
  if (userProfileItem) userProfileItem.style.display = "none";
}

// Logout Functionality
function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async function(e) {
      e.preventDefault();
      
      try {
        await auth.signOut();
        showToast("You have been logged out successfully.");
        // Redirect to home page after logout
        setTimeout(() => {
          if (window.showPage) {
            window.showPage("home");
          }
        }, 1000);
      } catch (error) {
        console.error("Logout error:", error);
        showToast("Logout failed. Please try again.", "error");
      }
    });
  }
}

// Profile Dropdown Toggle
function setupProfileDropdown() {
  const profileToggle = document.querySelector(".profile-toggle");
  if (profileToggle) {
    profileToggle.addEventListener("click", function(e) {
      e.stopPropagation();
      const dropdown = this.closest(".profile-dropdown");
      dropdown.classList.toggle("open");
    });
  }
  
  // Close dropdown when clicking outside
  document.addEventListener("click", function(e) {
    if (!e.target.closest(".profile-dropdown")) {
      document.querySelectorAll(".profile-dropdown").forEach(dropdown => {
        dropdown.classList.remove("open");
      });
    }
  });
}

// Initialize all authentication functionality
function initAuth() {
  setupPasswordToggles();
  setupRegistrationForm();
  setupLoginForm();
  setupForgotPassword();
  setupLogout();
  setupProfileDropdown();
}

// Call initAuth when DOM is fully loaded
document.addEventListener("DOMContentLoaded", initAuth);

// Add navigation for auth links
document.addEventListener("DOMContentLoaded", function() {
  // Add click event listeners to auth links
  document.querySelectorAll('.auth-link[data-page]').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const pageId = this.getAttribute('data-page');
      if (window.showPage) {
        window.showPage(pageId);
      }
    });
  });
  
  // Add click event listeners to register/login buttons in navbar
  document.querySelectorAll('.btn-register, .btn-login').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const pageId = this.classList.contains('btn-register') ? 'register' : 'login';
      if (window.showPage) {
        window.showPage(pageId);
      }
    });
  });
});

// FAQ Functionality
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  const searchInput = document.getElementById('faq-search');
  const categoryTabs = document.querySelectorAll('.category-tab');
  
  // Toggle FAQ items
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      item.classList.toggle('active');
    });
  });
  
  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      
      faqItems.forEach(item => {
        const question = item.querySelector('.faq-question span').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
        
        if (question.includes(searchTerm) || answer.includes(searchTerm)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }
  
  // Category filtering
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      
      // Update active tab
      categoryTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Filter items
      faqItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        if (category === 'all' || category === itemCategory) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initFAQ();
  initChatbot();
  // Add FAQ to navigation
  const navMenu = document.querySelector('.nav-menu');
  if (navMenu) {
    const faqNavItem = document.createElement('li');
    faqNavItem.className = 'nav-item';
    faqNavItem.innerHTML = '<a href="#faq" class="nav-link" data-page="faq">FAQ</a>';
    navMenu.insertBefore(faqNavItem, navMenu.querySelector('#register-item'));
  }
});

// AI Chatbot with Hugging Face Integration
function initChatbot() {
  const chatbotContainer = document.querySelector('.chatbot-container');
  const chatbotToggle = document.querySelector('.chatbot-toggle');
  const chatbotClose = document.querySelector('.chatbot-close');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSend = document.getElementById('chatbot-send');
  const chatbotMessages = document.querySelector('.chatbot-messages');
  const quickReplies = document.querySelectorAll('.quick-reply');
  const aiModeBtn = document.querySelector('.ai-mode-btn');
  const aiModeModal = document.querySelector('.ai-mode-modal');
  const aiOptions = document.querySelectorAll('.ai-option');
  const saveAiModeBtn = document.getElementById('save-ai-mode');
  
  // AI Configuration
  let currentAiMode = 'huggingface'; // Default AI mode
  const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';
  const HUGGINGFACE_API_KEY = ''; 
  
  // Conversation context for better responses
  let conversationContext = [];
  
  // WasteWealth knowledge base for local AI
  const wasteWealthKnowledge = {
  'register': {
    response: "To register with WasteWealth, click the 'Register' button at the top right of our website. You'll need to provide your name, email address, phone number, and physical address. The process is free and takes less than 2 minutes.",
    keywords: ['register', 'sign up', 'account', 'join', 'membership', 'create account', 'new user', 'open account']
  },
  'login': {
    response: "To log in, click the 'Login' button on the top right. Enter your registered email and password. If you forgot your password, click 'Forgot Password' to reset it.",
    keywords: ['login', 'sign in', 'log in', 'access account', 'forgot password', 'reset password', 'credentials']
  },
  'forgot password': {
    response: "If you forgot your password, click 'Forgot Password' on the login page, enter your email, and follow the reset link sent to you.",
    keywords: ['forgot password', 'reset password', 'change password', 'recover account']
  },
  'waste types': {
    response: "We accept: Biodegradable (₹5-10/kg), Non-biodegradable (₹8-15/kg), Organic (₹4-8/kg), E-waste (₹20-50/kg), Metal (₹15-30/kg).",
    keywords: ['waste', 'accept', 'collect', 'type', 'category', 'biodegradable', 'non-biodegradable', 'organic', 'e-waste', 'metal', 'plastic', 'glass', 'paper', 'garbage', 'trash']
  },
  'pricing': {
    response: "Pricing depends on waste type and weight. Example: Biodegradable (₹5-10/kg), E-waste (₹20-50/kg). Use our earnings calculator on the Pricing page to check.",
    keywords: ['price', 'cost', 'rate', 'how much', 'earn', 'money', '₹', 'rupee', 'charges', 'fees']
  },
  'schedule': {
    response: "To schedule a pickup: Log in → Click 'Schedule Pickup' → Choose waste type → Select date & time → Confirm address. Available Mon-Sat, 8 AM - 6 PM.",
    keywords: ['schedule', 'pickup', 'collect', 'when', 'arrange', 'book', 'appointment', 'time', 'slot']
  },
  'payment': {
    response: "Payments are credited to your WasteWealth wallet within 24 hours. Withdraw anytime to your bank account with no fees (minimum ₹100).",
    keywords: ['payment', 'withdraw', 'wallet', 'get paid', 'receive money', 'bank transfer', 'cash', 'earnings', 'payout']
  },
  'areas': {
    response: "We serve 15+ Indian cities including Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Kolkata, Pune, and more. Expanding soon!",
    keywords: ['area', 'city', 'location', 'serve', 'coverage', 'where', 'operate', 'service area', 'region']
  },
  'environment': {
    response: "We help the planet by reducing landfill waste, recycling materials, saving resources, and lowering pollution. You contribute to a greener Earth!",
    keywords: ['environment', 'eco', 'green', 'sustainable', 'planet', 'earth', 'climate', 'pollution', 'recycle', 'nature']
  },
  'support': {
    response: "For help, email support@wastewealth.com or call +91-9876543210 (Mon-Sat, 9 AM - 7 PM).",
    keywords: ['support', 'help', 'contact', 'customer care', 'issue', 'problem', 'complaint', 'service']
  },
  'offers': {
    response: "We run promotions like cashback on e-waste, referral bonuses, and festive rewards. Check 'Offers' in your account!",
    keywords: ['offers', 'discount', 'deal', 'cashback', 'promo', 'bonus', 'refer', 'reward']
  },
  'about': {
    response: "WasteWealth is India’s eco-friendly waste management platform. We turn waste into wealth by recycling and rewarding users.",
    keywords: ['about', 'company', 'who are you', 'mission', 'vision', 'info', 'organization']
  },
  'referral': {
    response: "Invite friends with your referral code. You both earn bonus credits when they complete their first pickup.",
    keywords: ['refer', 'referral', 'invite', 'friend', 'bonus', 'share code']
  },
  'app download': {
    response: "Download our app from Google Play Store or Apple App Store by searching 'WasteWealth'.",
    keywords: ['app', 'download', 'install', 'mobile', 'phone', 'application']
  },
  'working hours': {
    response: "We operate pickups Monday to Saturday from 8 AM to 6 PM. Support is available Mon-Sat, 9 AM - 7 PM.",
    keywords: ['time', 'working hours', 'open', 'when', 'days', 'timing', 'hours']
  },
  'holiday service': {
    response: "We don’t operate pickups on national holidays, but you can still schedule them for the next working day.",
    keywords: ['holiday', 'closed', 'day off', 'festival', 'weekend']
  },
  'minimum weight': {
    response: "Minimum pickup requirement is 2 kg for regular waste and 1 kg for e-waste.",
    keywords: ['minimum weight', 'pickup weight', 'limit', 'minimum kg', 'requirement']
  },
  'max weight': {
    response: "We can handle up to 100 kg in one pickup. For more, contact support.",
    keywords: ['maximum', 'limit', 'max weight', 'capacity', 'bulk waste']
  },
  'bulk pickup': {
    response: "For offices, societies, and events, we offer bulk pickups with special rates. Contact support to schedule.",
    keywords: ['bulk', 'large pickup', 'society', 'office', 'event', 'corporate']
  },
  'corporate plan': {
    response: "We provide corporate waste management plans with contracts, dedicated pickups, and special pricing.",
    keywords: ['corporate', 'business plan', 'company', 'office waste']
  },
  'school program': {
    response: "We run school awareness programs and recycling drives. Schools can partner with us for eco-initiatives.",
    keywords: ['school', 'education', 'students', 'program', 'awareness']
  },
  'ngo partnership': {
    response: "We partner with NGOs for waste awareness and recycling campaigns.",
    keywords: ['ngo', 'partner', 'charity', 'collaboration']
  },
  'carbon credits': {
    response: "By recycling with WasteWealth, you contribute to carbon footprint reduction and earn eco-points.",
    keywords: ['carbon', 'credits', 'footprint', 'offset', 'eco points']
  },
  'safety': {
    response: "Our collectors follow hygiene, safety, and COVID protocols including gloves, masks, and sanitizers.",
    keywords: ['safety', 'covid', 'hygiene', 'secure', 'protocols']
  },
  'tracking': {
    response: "You can track your pickup status in the app under 'My Pickups'.",
    keywords: ['track', 'status', 'live', 'progress', 'where is my waste']
  },
  'cancel pickup': {
    response: "To cancel, go to 'My Pickups' → Select Pickup → Cancel. Cancellation is free if done 2 hours before.",
    keywords: ['cancel', 'delete pickup', 'stop', 'remove request']
  },
  'reschedule pickup': {
    response: "To reschedule, open 'My Pickups' → Choose Pickup → Reschedule → Select new time.",
    keywords: ['reschedule', 'change time', 'modify', 'postpone']
  },
  'wallet': {
    response: "Your WasteWealth wallet stores your earnings. Withdraw anytime to bank with minimum ₹100.",
    keywords: ['wallet', 'balance', 'money', 'account', 'withdraw']
  },
  'bank transfer': {
    response: "Withdraw funds by linking your bank account under 'Payment Settings'.",
    keywords: ['bank', 'transfer', 'withdraw', 'account', 'deposit']
  },
  'upi': {
    response: "You can also withdraw via UPI to Google Pay, PhonePe, or Paytm.",
    keywords: ['upi', 'gpay', 'phonepe', 'paytm', 'bhim']
  },
  'security': {
    response: "We use encrypted connections and secure servers to protect your data.",
    keywords: ['security', 'privacy', 'data', 'safe', 'protected']
  },
  'recycling process': {
    response: "Collected waste is sorted, processed, and sent to recycling plants.",
    keywords: ['recycle process', 'how recycle', 'what happens to waste']
  },
  'certification': {
    response: "We provide recycling certificates for bulk clients, NGOs, and corporates.",
    keywords: ['certificate', 'proof', 'document', 'verification']
  },
  'faq': {
    response: "Visit our FAQ page for answers to common questions about registration, payments, and pickups.",
    keywords: ['faq', 'questions', 'doubts', 'help center']
  },
  'feedback': {
    response: "We value feedback! Share your suggestions via app or email.",
    keywords: ['feedback', 'suggestion', 'review', 'complaint']
  },
  'careers': {
    response: "We’re hiring! Visit our Careers page for openings in operations, marketing, and tech.",
    keywords: ['career', 'job', 'hiring', 'vacancy', 'work']
  },
  'partnership': {
    response: "Businesses can partner with us for recycling drives and CSR projects.",
    keywords: ['partnership', 'collaboration', 'tie-up', 'csr']
  },
  'csr': {
    response: "WasteWealth supports CSR by enabling companies to fulfill eco-responsibility.",
    keywords: ['csr', 'corporate responsibility', 'social responsibility']
  },
  'documents': {
    response: "We require a valid address proof and ID proof for large pickups.",
    keywords: ['documents', 'id', 'proof', 'verification']
  },
  'language support': {
    response: "Our app is available in English, Hindi, Tamil, Telugu, and Marathi.",
    keywords: ['language', 'hindi', 'english', 'marathi', 'tamil', 'telugu']
  },
  'update profile': {
    response: "To update your details, go to Profile → Edit Info.",
    keywords: ['update profile', 'change name', 'edit account']
  },
  'delete account': {
    response: "To delete your account, contact support. Your wallet must be empty before closure.",
    keywords: ['delete account', 'close account', 'remove account']
  },
  'rewards': {
    response: "Earn eco-points for every pickup. Redeem them for gift vouchers.",
    keywords: ['reward', 'points', 'voucher', 'redeem', 'eco points']
  },
  'gift cards': {
    response: "You can redeem wallet balance for Amazon or Flipkart gift cards.",
    keywords: ['gift','gift card', 'amazon', 'flipkart', 'voucher']
  },
  'news': {
    response: "Read about our latest recycling initiatives in the News section.",
    keywords: ['news', 'update', 'latest', 'media']
  },
  'blog': {
    response: "Our blog shares tips on recycling and sustainable living.",
    keywords: ['blog', 'article', 'tips', 'guides']
  },
  'social media': {
    response: "Follow us on Facebook, Instagram, Twitter, and LinkedIn for updates.",
    keywords: ['facebook', 'instagram', 'twitter', 'linkedin', 'social']
  }
};

  
  // Initialize chatbot
  function init() {
    loadAiPreferences();
    setupEventListeners();
    // Add welcome message after a short delay
    setTimeout(() => {
      addMessage("I'm your AI assistant specialized in waste management and recycling. I can help you with registration, waste types, pricing, scheduling pickups, and more. What would you like to know?", 'bot');
    }, 1000);
  }

  
  // Set up event listeners
  function setupEventListeners() {
    // Toggle chatbot
    if (chatbotToggle) {
      chatbotToggle.addEventListener('click', () => {
        chatbotContainer.classList.toggle('open');
        document.querySelector('.notification-dot').style.display = 'none';
      });
    }
    
    // Close chatbot
    if (chatbotClose) {
      chatbotClose.addEventListener('click', () => {
        chatbotContainer.classList.remove('open');
      });
    }
    
    // Send message function
    function sendMessage() {
      const message = chatbotInput.value.trim();
      if (message) {
        addMessage(message, 'user');
        chatbotInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Get AI response
        getAiResponse(message);
      }
    }
    
    // Send message on button click
    if (chatbotSend) {
      chatbotSend.addEventListener('click', sendMessage);
    }
    
    // Send message on Enter key
    if (chatbotInput) {
      chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
    }
    
    // Quick replies
    quickReplies.forEach(reply => {
      reply.addEventListener('click', function() {
        const question = this.getAttribute('data-question');
        addMessage(question, 'user');
        showTypingIndicator();
        getAiResponse(question);
      });
    });
    
    // AI mode selector
    if (aiModeBtn) {
      aiModeBtn.addEventListener('click', () => {
        aiModeModal.classList.add('active');
      });
    }
    
    // AI mode options
    aiOptions.forEach(option => {
      option.addEventListener('click', function() {
        aiOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
      });
    });
    
    // Save AI mode
    if (saveAiModeBtn) {
      saveAiModeBtn.addEventListener('click', () => {
        const selectedMode = document.querySelector('.ai-option.active').getAttribute('data-ai');
        currentAiMode = selectedMode;
        saveAiPreferences();
        aiModeModal.classList.remove('active');
        addMessage(`AI mode changed to ${selectedMode.toUpperCase()}`, 'bot');
      });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === aiModeModal) {
        aiModeModal.classList.remove('active');
      }
    });
  }
  
  // Save AI preferences to localStorage
  function saveAiPreferences() {
    localStorage.setItem('wasteWealthAiMode', currentAiMode);
  }
  
  // Load AI preferences from localStorage
  function loadAiPreferences() {
    const savedMode = localStorage.getItem('wasteWealthAiMode');
    if (savedMode) {
      currentAiMode = savedMode;
      // Update UI to show active mode
      aiOptions.forEach(option => {
        if (option.getAttribute('data-ai') === currentAiMode) {
          option.classList.add('active');
        } else {
          option.classList.remove('active');
        }
      });
    }
  }
  
  // Add message to chat
  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = `<p>${text}</p>`;
    
    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = getCurrentTime();
    
    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);
    
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    
    // Add to conversation context (keep last 5 messages)
    if (sender === 'user') {
      conversationContext.push({ role: 'user', content: text });
    } else {
      conversationContext.push({ role: 'assistant', content: text });
    }
    
    // Keep only the last 5 exchanges (10 messages total)
    if (conversationContext.length > 10) {
      conversationContext = conversationContext.slice(-10);
    }
  }
  
  // Get current time for message timestamp
  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Show typing indicator
  function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
  <div class="typing-dots">
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  </div>
`;

    
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }
  
  // Remove typing indicator
  function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  // Get AI response based on selected mode
  async function getAiResponse(userMessage) {
    try {
      let response;
      
      switch (currentAiMode) {
        case 'huggingface':
          response = await getHuggingFaceResponse(userMessage);
          break;
        case 'local':
        default:
          response = await getLocalAiResponse(userMessage);
          break;
      }
      
      // Simulate typing delay based on response length
      const delay = Math.min(2000, Math.max(1000, response.length * 20));
      
      setTimeout(() => {
        removeTypingIndicator();
        addMessage(response, 'bot');
      }, delay);
      
    } catch (error) {
      console.error('AI response error:', error);
      removeTypingIndicator();
      
      // Fallback to local AI if other methods fail
      if (currentAiMode !== 'local') {
        addMessage("I'm having trouble connecting to the AI service. Switching to local mode.", 'bot');
        currentAiMode = 'local';
        saveAiPreferences();
        
        setTimeout(() => {
          getLocalAiResponse(userMessage).then(response => {
            addMessage(response, 'bot');
          });
        }, 1000);
      } else {
        addMessage("I'm sorry, I'm experiencing technical difficulties. Please try again later.", 'bot');
      }
    }
  }
  
  // Hugging Face AI integration - ACTUAL IMPLEMENTATION
  async function getHuggingFaceResponse(message) {
    try {
      // Prepare the conversation context for the model
      const context = conversationContext.map(msg => 
        `${msg.role === 'user' ? 'User: ' : 'Assistant: '}${msg.content}`
      ).join('\n');
      
      // Create a prompt that includes context and waste management specialization
      const prompt = `You are WasteWealth AI, a helpful assistant for waste management and recycling services.
      
Previous conversation:
${context}

User: ${message}

Assistant:`;
      
      const model = "microsoft/DialoGPT-small"; // Good for conversations
      
      const response = await fetch(
        `${HUGGINGFACE_API_URL}/${model}`,
        {
          headers: { 
            Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({ 
            inputs: prompt,
            parameters: {
              max_length: 200,
              temperature: 0.7,
              do_sample: true,
              return_full_text: false
            }
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Extract the generated text from the response
      let generatedText = '';
      if (Array.isArray(result) && result[0] && result[0].generated_text) {
        generatedText = result[0].generated_text;
      } else if (result.generated_text) {
        generatedText = result.generated_text;
      } else {
        throw new Error('Unexpected response format from Hugging Face');
      }
      
      // Clean up the response
      generatedText = generatedText
        .replace(/Assistant:\s*/i, '') 
        .trim();
      
      // If the response is too generic, fall back to local knowledge
      if (generatedText.length < 10 || isTooGeneric(generatedText)) {
        return getEnhancedResponse(message, true);
      }
      
      return generatedText;
      
    } catch (error) {
      console.error('Hugging Face API error:', error);
      // Fall back to local AI
      return getEnhancedResponse(message, true);
    }
  }
  
  // Check if response is too generic
  function isTooGeneric(text) {
    const genericPatterns = [
      /I don't know/i,
      /I'm not sure/i,
      /I don't understand/i,
      /can you repeat/i,
      /can you rephrase/i,
      /^that's a good question$/i,
      /^I'm not programmed/i
    ];
    
    return genericPatterns.some(pattern => pattern.test(text));
  }
  
  // Local AI using semantic matching
  async function getLocalAiResponse(message) {
    // Simple delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return getEnhancedResponse(message);
  }
  
  // Enhanced response logic with waste management knowledge
  function getEnhancedResponse(message, enhanced = false) {
    const lowerMessage = message.toLowerCase();
    
    // Check for greetings
    if (/(hello|hi|hey|greetings|good\s(morning|afternoon|evening))/.test(lowerMessage)) {
      return enhanced ? 
        "Hello! 😊 I'm your WasteWealth AI assistant. I can help you with waste management, recycling information, pricing, scheduling pickups, and more. What would you like to know today?" :
        "Hi there! How can I help you with WasteWealth today?";
    }
    
    // Check for thanks
    if (/(thanks|thank you|appreciate|grateful)/.test(lowerMessage)) {
      return enhanced ?
        "You're very welcome! 😊 I'm glad I could help. Is there anything else you'd like to know about waste management or our services?" :
        "You're welcome! Let me know if you need anything else.";
    }
    
    // Check knowledge base for matches
    let bestMatch = null;
    let highestScore = 0;
    
    for (const [topic, data] of Object.entries(wasteWealthKnowledge)) {
      let score = 0;
      for (const keyword of data.keywords) {
        if (lowerMessage.includes(keyword)) {
          score += 1;
          // Additional points for exact matches
          if (lowerMessage === keyword || new RegExp(`\\b${keyword}\\b`).test(lowerMessage)) {
            score += 2;
          }
        }
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = topic;
      }
    }
    
    // If we found a good match, return the appropriate response
    if (bestMatch && highestScore >= 1) {
      const response = wasteWealthKnowledge[bestMatch].response;
      return enhanced ? 
        `${response} ${getFollowUpQuestion(bestMatch)}` :
        response;
    }
    
    // Default response for unknown queries
    return enhanced ?
      "I'm not sure I understand your question completely. Could you provide more details about your waste management needs? I specialize in recycling, pricing, scheduling pickups, and our registration process." :
      "I'm not sure about that. Could you rephrase your question? I can help with waste management and recycling topics.";
  }
  
  // Get follow-up question based on topic
  function getFollowUpQuestion(topic) {
    const followUps = {
      'register': "Would you like me to guide you through the registration process?",
      'waste types': "Do you need more details about any specific waste category?",
      'pricing': "Would you like to use our earnings calculator to estimate potential income?",
      'schedule': "Would you like help scheduling a pickup right now?",
      'payment': "Do you need assistance with setting up withdrawal methods?",
      'areas': "Would you like to know when we're expanding to new areas?",
      'environment': "Would you like to learn more about how recycling benefits the environment?"
    };
    
    return followUps[topic] || "Is there anything else I can help you with?";
  }
  
  // Initialize the chatbot
  init();
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize EmailJS with your Public Key
    emailjs.init('vJdyxFp8wXSjZg6Bi');

    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // Simple validation
            if (!name || !email || !subject || !message) {
                alert('⚠️ Please fill in all fields');
                return;
            }
            
            // Email validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                alert('⚠️ Please enter a valid email address');
                return;
            }
            
            // Disable button while sending
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = "Sending...";

            // Send email using EmailJS
            emailjs.send('service_ror6vlb', 'template_uv8pm3l', {
                from_name: name,
                reply_to: email,
                subject: subject,
                message: message
            })
            .then(function(response) {
                alert('✅ Message sent successfully!');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerText = "Send Message";
            }, function(error) {
                alert('❌ Failed to send message. Please try again later.');
                console.error('EmailJS error:', error);
                submitBtn.disabled = false;
                submitBtn.innerText = "Send Message";
            });
        });
    }
});