// pages/terms-of-service.tsx
export default function TermsOfServicePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Terms of Service</h1>

      <p className="mb-4">
        Welcome to <strong>LastMinutePreparation</strong>. By accessing or using our platform, you agree to comply with these Terms of Service. Please read them carefully.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
      <p className="mb-4">
        By using our website, mobile app, or services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, please do not use our services.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">2. Use of Services</h2>
      <ul className="list-disc list-inside mb-4">
        <li>You must be at least 13 years old to use our services.</li>
        <li>Use the platform for lawful and educational purposes only.</li>
        <li>You agree not to misuse, copy, distribute, or attempt to reverse-engineer our services.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">3. Accounts</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Users may need to create an account to access certain features.</li>
        <li>Keep your account credentials confidential and secure.</li>
        <li>Notify us immediately of any unauthorized account activity.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">4. Payments and Subscriptions</h2>
      <p className="mb-4">
        If you subscribe to premium services, you agree to pay all applicable fees. Payments are non-refundable unless otherwise stated. We reserve the right to modify pricing at any time.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">5. Intellectual Property</h2>
      <p className="mb-4">
        All content, features, and technology on LastMinutePreparation are owned by us or our licensors and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce or distribute content without permission.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">6. User Content</h2>
      <p className="mb-4">
        Any content you upload (questions, images, PDFs) must not violate any laws or third-party rights. By uploading content, you grant us a license to use it for service functionality.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">7. Limitation of Liability</h2>
      <p className="mb-4">
        LastMinutePreparation is provided "as is". We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of our platform.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">8. Termination</h2>
      <p className="mb-4">
        We reserve the right to suspend or terminate your account or access if you violate these Terms of Service or engage in fraudulent or harmful activities.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">9. Changes to Terms</h2>
      <p className="mb-4">
        We may update these Terms at any time. Users will be notified of significant changes, and continued use of the platform constitutes acceptance of the updated terms.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">10. Contact</h2>
      <p className="mb-4">
        If you have questions or concerns regarding these Terms, please contact us at: <a href="mailto:support@lastminutepreparation.com" className="text-blue-400">support@lastminutepreparation.com</a>.
      </p>

      <p className="mt-6 text-sm text-gray-400 text-center">
        Last updated: October 22, 2025
      </p>
    </div>
  );
}
