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
  apiKey: "AIzaSyAjv5iTU5XYn4GuCKjMg9jofWAwMA_8brY",
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
      
      // Show success message immediately
      showToast("Registration successful! Please login with your credentials.");
      
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