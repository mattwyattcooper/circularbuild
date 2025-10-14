import Link from "next/link";
import type { ReactNode } from "react";

import PrivacyView from "./privacy-view";

export const metadata = {
  title: "Privacy Notice | CircularBuild",
  description:
    "Learn how CircularBuild collects, uses, and protects information shared across the donation platform.",
};

export type PrivacySection = {
  title: string;
  body: ReactNode;
};

const SECTIONS: PrivacySection[] = [
  {
    title: "1. Introduction",
    body: (
      <>
        <p>
          CircularBuild (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
          &ldquo;us&rdquo;) is committed to protecting your privacy and
          maintaining transparency about how we collect, use, and share
          information.
        </p>
        <p>
          This Privacy Policy explains what data we collect when you access or
          use our website, mobile interfaces, messaging features, or other
          online services (collectively, the &ldquo;Platform&rdquo;), and how
          that data is handled in accordance with applicable data protection
          laws, including the California Consumer Privacy Act (CCPA) and the EU
          General Data Protection Regulation (GDPR) where applicable.
        </p>
        <p>
          By using the Platform, you consent to the collection, storage, and use
          of your information as described in this Policy.
        </p>
      </>
    ),
  },
  {
    title: "2. Information we collect",
    body: (
      <>
        <p>
          We collect both personal and non-personal information in the following
          categories:
        </p>
        <p className="font-semibold">A. Information You Provide Directly</p>
        <ul>
          <li>
            Name, organization name, email address, phone number, and location.
          </li>
          <li>Account credentials or authentication tokens.</li>
          <li>
            Donation listings, material descriptions, images, and
            communications.
          </li>
          <li>Messages and chat content sent through the Platform.</li>
          <li>
            Any information provided when contacting support or completing
            forms.
          </li>
        </ul>
        <p className="font-semibold">B. Information Collected Automatically</p>
        <ul>
          <li>
            IP address, browser type, device identifiers, and operating system.
          </li>
          <li>Referring URLs, page interactions, and access timestamps.</li>
          <li>
            Cookie data and session analytics for security, diagnostics, and
            improvement.
          </li>
        </ul>
        <p className="font-semibold">C. Information from Third Parties</p>
        <ul>
          <li>
            If you sign in or interact using third-party services (for example,
            Google or social logins), we may receive limited profile or
            authentication information as permitted by those services.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "3. How we use your information",
    body: (
      <>
        <p>We use collected data to:</p>
        <ul>
          <li>Operate, maintain, and improve the Platform.</li>
          <li>
            Facilitate matches and communication between donors, recipients, and
            nonprofits.
          </li>
          <li>Verify user identities and maintain Platform security.</li>
          <li>
            Respond to inquiries, provide support, and enforce our Terms &
            Conditions.
          </li>
          <li>
            Analyze aggregated data to improve Platform performance and impact.
          </li>
          <li>
            Comply with legal obligations and cooperate with law enforcement
            when required.
          </li>
        </ul>
        <p>
          Your messages and other communications may be stored and reviewed to
          ensure compliance with our safety, moderation, and quality assurance
          policies.
        </p>
      </>
    ),
  },
  {
    title: "4. Message storage and monitoring",
    body: (
      <>
        <p>
          By using the Platform’s chat, messaging, or communication tools, you
          acknowledge and consent to the following:
        </p>
        <ul>
          <li>
            <strong>Retention:</strong> CircularBuild may store messages,
            attachments, and metadata for moderation, dispute resolution,
            compliance, and system integrity.
          </li>
          <li>
            <strong>Review:</strong> Authorized personnel may review messages in
            cases of abuse reports, fraud prevention, or technical
            troubleshooting.
          </li>
          <li>
            <strong>Disclosure:</strong> Messages may be disclosed if legally
            required or to protect the safety and rights of others.
          </li>
          <li>
            <strong>Security:</strong> We apply encryption and restricted access
            to limit unauthorized viewing.
          </li>
        </ul>
        <p>
          CircularBuild does not sell, rent, or license private message contents
          to third parties for advertising.
        </p>
      </>
    ),
  },
  {
    title: "5. Cookies and tracking technologies",
    body: (
      <>
        <p>We use cookies and similar technologies to:</p>
        <ul>
          <li>Remember user preferences and login sessions.</li>
          <li>Collect aggregated usage analytics.</li>
          <li>Secure the Platform against abuse and fraud.</li>
        </ul>
        <p>
          You can control or delete cookies through your browser settings;
          however, disabling them may affect functionality.
        </p>
      </>
    ),
  },
  {
    title: "6. Data sharing and disclosure",
    body: (
      <>
        <p>
          We do not sell or trade your personal information. We may share
          limited data only as necessary with:
        </p>
        <ul>
          <li>
            <strong>Service providers:</strong> For hosting, analytics,
            communication, or technical support.
          </li>
          <li>
            <strong>Legal authorities:</strong> When required by law or to
            respond to lawful requests.
          </li>
          <li>
            <strong>Transaction partners:</strong> To facilitate donation
            logistics between donors and recipients.
          </li>
          <li>
            <strong>Business transfers:</strong> If CircularBuild undergoes a
            merger, acquisition, or reorganization, your data may transfer to
            the successor entity.
          </li>
        </ul>
        <p>
          All third parties are required to safeguard personal information and
          use it only for authorized purposes.
        </p>
      </>
    ),
  },
  {
    title: "7. Data retention",
    body: (
      <p>
        We retain data only as long as necessary to fulfill the purposes
        outlined in this Policy, comply with legal obligations, resolve
        disputes, and enforce our agreements. Inactive accounts or chat data may
        be archived or deleted after a reasonable period.
      </p>
    ),
  },
  {
    title: "8. Data security",
    body: (
      <p>
        We implement industry-standard security measures, including encryption,
        firewalls, and access controls, to protect data from unauthorized
        access, alteration, or destruction. However, no online service is 100%
        secure, and we cannot guarantee absolute protection against all threats.
      </p>
    ),
  },
  {
    title: "9. Your rights and choices",
    body: (
      <>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access, correct, or delete personal data we hold about you.</li>
          <li>Request a copy of your data in a portable format.</li>
          <li>Withdraw consent for certain data processing.</li>
          <li>Opt out of marketing or analytics communications.</li>
          <li>Lodge complaints with your local data protection authority.</li>
        </ul>
        <p>
          To exercise these rights, contact us at the email address provided on
          our Contact page. We may verify your identity before processing
          requests.
        </p>
      </>
    ),
  },
  {
    title: "10. Children’s privacy",
    body: (
      <p>
        The Platform is not directed to children under 13 (or under 16 in
        certain jurisdictions). We do not knowingly collect or process personal
        information from minors. If you believe a child has provided information
        to us, contact us and we will promptly delete it.
      </p>
    ),
  },
  {
    title: "11. International data transfers",
    body: (
      <p>
        CircularBuild is operated in the United States. If you access the
        Platform from outside the U.S., you consent to your data being
        transferred and processed in the U.S., which may not provide the same
        level of data protection as your jurisdiction.
      </p>
    ),
  },
  {
    title: "12. Updates to this policy",
    body: (
      <p>
        We may modify or update this Privacy Policy periodically. When we do, we
        will revise the &ldquo;Last updated&rdquo; date above and, if changes
        are significant, notify users via email or in-app notice. Continued use
        of the Platform constitutes acceptance of the updated Policy.
      </p>
    ),
  },
  {
    title: "13. Contact information",
    body: (
      <p>
        If you have questions, concerns, or requests regarding this Privacy
        Policy or our data practices, please contact us through our{" "}
        <Link href="/contact">Contact page</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return <PrivacyView sections={SECTIONS} lastUpdated="October 12, 2025" />;
}
