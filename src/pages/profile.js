// 사용자 프로필 화면

import { getUser } from '../core/api.js';
import { createElement } from '../utils/dom.js';

export class ProfilePage {
  constructor(props = {}) {
    this.props = props;
    this.user = null;
  }

  async loadUser() {
    try {
      this.user = await getUser();
      return this.user;
    } catch (error) {
      console.error('Failed to load user:', error);
      throw error;
    }
  }

  render() {
    const container = createElement('div', { className: 'user-profile-container' });
    container.style.padding = '20px';

    // Loading state
    const loading = createElement('div', {
      className: 'widget-loading',
      innerHTML: 'Loading user profile...'
    });
    container.appendChild(loading);

    // Load and render user
    this.loadUser()
      .then(() => {
        container.innerHTML = '';
        const profile = this.renderProfile();
        container.appendChild(profile);
      })
      .catch(error => {
        container.innerHTML = '';
        const errorEl = createElement('div', {
          className: 'widget-error',
          innerHTML: `Failed to load profile: ${error.message}`
        });
        container.appendChild(errorEl);
      });

    return container;
  }

  renderProfile() {
    const profile = createElement('div', { className: 'user-profile' });

    profile.innerHTML = `
      <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e0e0e0;">
        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px;">
          <img src="${this.user.avatar}" alt="${this.user.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
          <div>
            <h2 style="margin: 0 0 8px 0;">${this.user.name}</h2>
            <p style="color: #6c757d; margin: 0;">${this.user.email}</p>
          </div>
        </div>

        <div style="border-top: 1px solid #e0e0e0; padding-top: 20px;">
          <h3 style="margin-bottom: 16px;">Account Information</h3>
          <div style="display: grid; gap: 12px;">
            <div>
              <strong>Member Since:</strong> ${new Date(this.user.memberSince).toLocaleDateString()}
            </div>
            <div>
              <strong>Phone:</strong> ${this.user.phone || 'Not provided'}
            </div>
            <div>
              <strong>Address:</strong> ${this.user.address || 'Not provided'}
            </div>
          </div>
        </div>

        <button class="widget-button" style="margin-top: 20px; width: 100%;">Edit Profile</button>
      </div>
    `;

    return profile;
  }
}
