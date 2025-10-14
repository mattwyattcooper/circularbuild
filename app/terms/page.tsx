import Link from "next/link";
import type { ReactNode } from "react";

import TermsView from "./terms-view";

export const metadata = {
  title: "Terms & Conditions | CircularBuild",
  description:
    "Read the CircularBuild terms and conditions outlining responsibilities for donors and recipients using the marketplace.",
};

export type TermsSection = {
  title: string;
  body: ReactNode;
};

const SECTIONS: TermsSection[] = [
  {
    title: "1. Acceptance of terms",
    body: (
      <p>
        By creating an account or listing, browsing, requesting, or accepting
        materials on CircularBuild (the "Platform"), you acknowledge that you
        have read, understood, and agree to be bound by these Terms &
        Conditions. If you are acting on behalf of an organization, you
        represent that you are authorized to accept these terms for that
        organization.
      </p>
    ),
  },
  {
    title: "2. CircularBuild is a facilitator, not a seller",
    body: (
      <p>
        CircularBuild operates solely as a donation-based marketplace that
        facilitates introductions between donors and recipients of construction
        materials and equipment. CircularBuild does not take ownership of any
        materials listed on the Platform, does not inspect or certify materials,
        and is not a party to the transactions or arrangements that donors and
        recipients may enter into.
      </p>
    ),
  },
  {
    title: '3. Donations are provided "as is"',
    body: (
      <p>
        All materials are donated by third parties on an "AS IS," "WHERE IS,"
        and "AS AVAILABLE" basis with all faults and without warranties of any
        kind. CircularBuild, its officers, directors, employees, volunteers,
        advisors, and partners expressly disclaim any and all warranties,
        express or implied, including implied warranties of merchantability,
        fitness for a particular purpose, or non-infringement. Donors are solely
        responsible for accurately describing the condition of materials.
        Recipients are solely responsible for assessing the suitability and
        safety of any materials before transporting, installing, or using them.
      </p>
    ),
  },
  {
    title: "4. Release of liability",
    body: (
      <p>
        To the fullest extent permitted by law, you release and hold harmless
        CircularBuild and anyone affiliated with CircularBuild from and against
        any claims, damages, liabilities, losses, injuries, costs, or expenses
        (including reasonable attorneys' fees) arising out of or related to: (a)
        materials donated, requested, transported, received, stored, installed,
        or used through the Platform; (b) any agreements or disputes between
        donors and recipients; (c) property damage, bodily injury, death,
        environmental contamination, regulatory violations, or delays connected
        to such materials; or (d) your breach of these terms or applicable law.
      </p>
    ),
  },
  {
    title: "5. Safety and compliance",
    body: (
      <p>
        You are solely responsible for complying with all applicable laws,
        codes, regulations, and industry standards related to the storage,
        handling, use, reuse, disposal, or installation of donated materials.
        This includes but is not limited to building codes, zoning requirements,
        environmental regulations, transportation restrictions, and occupational
        safety rules. CircularBuild may, but is not obligated to, remove
        listings that appear non-compliant or unsafe.
      </p>
    ),
  },
  {
    title: "6. No guarantee of availability",
    body: (
      <p>
        CircularBuild makes no guarantee that materials listed on the Platform
        will be available, meet your needs, or be delivered on any timeline.
        Donors may withdraw listings at any time. Recipients are responsible for
        coordinating pickup, delivery, or logistics directly with the donor.
      </p>
    ),
  },
  {
    title: "7. Limitation of liability",
    body: (
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, CIRCULARBUILD, ITS OFFICERS,
        DIRECTORS, EMPLOYEES, VOLUNTEERS, ADVISORS, AND PARTNERS WILL NOT BE
        LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
        PUNITIVE, OR CONSEQUENTIAL DAMAGES (INCLUDING LOST PROFITS OR BUSINESS
        INTERRUPTION) ARISING OUT OF OR RELATED TO THE PLATFORM OR MATERIALS
        DONATED THROUGH THE PLATFORM. IF ANY LIABILITY IS FOUND DESPITE THIS
        DISCLAIMER, THAT LIABILITY WILL BE LIMITED TO THE FULLEST EXTENT
        PERMITTED BY APPLICABLE LAW.
      </p>
    ),
  },
  {
    title: "8. Indemnification",
    body: (
      <p>
        You agree to indemnify, defend, and hold harmless CircularBuild, its
        officers, directors, employees, volunteers, advisors, and partners from
        and against any third-party claims, losses, damages, liabilities, costs,
        and expenses (including reasonable attorneys' fees) arising out of your
        access to or use of the Platform, your listings or requests, your
        handling or use of materials, or your violation of these terms or any
        applicable law.
      </p>
    ),
  },
  {
    title: "9. Changes to the Platform or terms",
    body: (
      <p>
        CircularBuild may modify, suspend, or discontinue the Platform at any
        time without notice. We may also update these Terms & Conditions
        periodically. The "Last updated" date below reflects the latest
        revision. Continued use of the Platform after changes go into effect
        constitutes acceptance of the revised terms.
      </p>
    ),
  },
  {
    title: "10. Governing law",
    body: (
      <p>
        These Terms & Conditions are governed by and construed in accordance
        with the laws of the United States and the state or jurisdiction in
        which CircularBuild is incorporated, without regard to conflict-of-laws
        principles.
      </p>
    ),
  },
  {
    title: "11. Communications and message storage",
    body: (
      <>
        <p>
          By using the Platform’s messaging, chat, or communication features,
          you expressly consent to the collection, storage, review, and use of
          such communications by CircularBuild for purposes including safety,
          moderation, quality assurance, and compliance with applicable law.
        </p>
        <p>
          Messages may be retained, analyzed, or disclosed if required by law or
          when reasonably necessary to protect the rights, property, or safety
          of CircularBuild, its users, or the public. You acknowledge that
          communications transmitted through the Platform are not confidential
          between you and other users, and CircularBuild has no obligation to
          monitor or retain any communication.
        </p>
      </>
    ),
  },
  {
    title: "12. User conduct and prohibited activities",
    body: (
      <>
        <p>
          You agree not to use the Platform for any unlawful, fraudulent, or
          harmful purpose, including but not limited to:
        </p>
        <ol className="list-[lower-alpha] space-y-1 pl-6">
          <li>
            uploading or distributing harmful, offensive, or misleading content;
          </li>
          <li>impersonating any person or entity;</li>
          <li>
            attempting to gain unauthorized access to accounts, systems, or
            data;
          </li>
          <li>
            interfering with the operation of the Platform through bots,
            scripts, or malicious code;
          </li>
          <li>
            posting listings that violate local, state, or federal laws; or
          </li>
          <li>
            soliciting payment or compensation for materials designated as
            donations.
          </li>
        </ol>
        <p>
          CircularBuild reserves the right to suspend or terminate accounts that
          violate these provisions.
        </p>
      </>
    ),
  },
  {
    title: "13. Data collection and privacy",
    body: (
      <>
        <p>
          By using the Platform, you consent to the collection and processing of
          personal data as described in CircularBuild’s{" "}
          <Link href="/privacy">Privacy Notice</Link>. This may include your
          name, contact information, location, listings, messages, and usage
          data.
        </p>
        <p>
          CircularBuild will take commercially reasonable measures to safeguard
          such data but cannot guarantee absolute security. You acknowledge that
          data transmissions over the internet are inherently insecure and that
          CircularBuild shall not be liable for unauthorized access, disclosure,
          or loss of data.
        </p>
      </>
    ),
  },
  {
    title: "14. Intellectual property",
    body: (
      <>
        <p>
          All content, software, and visual elements on the Platform, including
          but not limited to the CircularBuild name, logo, layout, design, text,
          graphics, and code, are the property of CircularBuild or its licensors
          and are protected by copyright, trademark, and other intellectual
          property laws.
        </p>
        <p>
          You may not reproduce, modify, distribute, or create derivative works
          from such materials without prior written consent. User-submitted
          listings, photos, or descriptions remain your property, but by
          uploading them, you grant CircularBuild a worldwide, royalty-free,
          non-exclusive license to display, host, and distribute such content
          for the operation and promotion of the Platform.
        </p>
      </>
    ),
  },
  {
    title: "15. Third-party links and integrations",
    body: (
      <>
        <p>
          The Platform may contain links to third-party websites or integrations
          with external services (for example, payment processors, logistics
          partners, or AI tools). CircularBuild does not control, endorse, or
          assume responsibility for such third-party services.
        </p>
        <p>
          Your interactions with them are solely between you and the third
          party, and any disputes shall be governed by that third party’s terms
          and privacy policies.
        </p>
      </>
    ),
  },
  {
    title: "16. Dispute resolution and arbitration",
    body: (
      <>
        <p>
          Any dispute, claim, or controversy arising out of or related to these
          Terms, the Platform, or any transactions facilitated thereby shall be
          resolved by binding arbitration administered by the American
          Arbitration Association under its Commercial Arbitration Rules.
        </p>
        <p>
          The arbitration shall take place in the state where CircularBuild is
          incorporated. Judgment on the award rendered by the arbitrator may be
          entered in any court having jurisdiction. Each party shall bear its
          own attorneys’ fees unless otherwise awarded by the arbitrator. You
          waive any right to participate in class actions or jury trials.
        </p>
      </>
    ),
  },
  {
    title: "17. Severability and entire agreement",
    body: (
      <>
        <p>
          If any provision of these Terms is found to be invalid, illegal, or
          unenforceable, the remaining provisions shall remain in full force and
          effect.
        </p>
        <p>
          These Terms, together with the Privacy Policy and any posted
          guidelines or rules, constitute the entire agreement between you and
          CircularBuild regarding your use of the Platform and supersede any
          prior agreements or understandings, whether oral or written.
        </p>
      </>
    ),
  },
  {
    title: "Contact",
    body: (
      <p>
        For questions about these terms, please reach out via the{" "}
        <Link href="/contact">Contact page</Link> on the Platform.
      </p>
    ),
  },
];

export default function TermsPage() {
  return <TermsView sections={SECTIONS} lastUpdated="October 12, 2025" />;
}
