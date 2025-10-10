import TermsView from "./terms-view";

export const metadata = {
  title: "Terms & Conditions | CircularBuild",
  description:
    "Read the CircularBuild terms and conditions outlining responsibilities for donors and recipients using the marketplace.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of terms",
    body: `By creating an account or listing, browsing, requesting, or accepting materials on CircularBuild (the "Platform"), you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. If you are acting on behalf of an organization, you represent that you are authorized to accept these terms for that organization.`,
  },
  {
    title: "2. CircularBuild is a facilitator, not a seller",
    body: `CircularBuild operates solely as a donation-based marketplace that facilitates introductions between donors and recipients of construction materials and equipment. CircularBuild does not take ownership of any materials listed on the Platform, does not inspect or certify materials, and is not a party to the transactions or arrangements that donors and recipients may enter into.`,
  },
  {
    title: '3. Donations are provided "as is"',
    body: `All materials are donated by third parties on an "AS IS," "WHERE IS," and "AS AVAILABLE" basis with all faults and without warranties of any kind. CircularBuild, its officers, directors, employees, volunteers, advisors, and partners expressly disclaim any and all warranties, express or implied, including implied warranties of merchantability, fitness for a particular purpose, or non-infringement. Donors are solely responsible for accurately describing the condition of materials. Recipients are solely responsible for assessing the suitability and safety of any materials before transporting, installing, or using them.`,
  },
  {
    title: "4. Release of liability",
    body: `To the fullest extent permitted by law, you release and hold harmless CircularBuild and anyone affiliated with CircularBuild from and against any claims, damages, liabilities, losses, injuries, costs, or expenses (including reasonable attorneys' fees) arising out of or related to: (a) materials donated, requested, transported, received, stored, installed, or used through the Platform; (b) any agreements or disputes between donors and recipients; (c) property damage, bodily injury, death, environmental contamination, regulatory violations, or delays connected to such materials; or (d) your breach of these terms or applicable law.`,
  },
  {
    title: "5. Safety and compliance",
    body: `You are solely responsible for complying with all applicable laws, codes, regulations, and industry standards related to the storage, handling, use, reuse, disposal, or installation of donated materials. This includes but is not limited to building codes, zoning requirements, environmental regulations, transportation restrictions, and occupational safety rules. CircularBuild may, but is not obligated to, remove listings that appear non-compliant or unsafe.`,
  },
  {
    title: "6. No guarantee of availability",
    body: `CircularBuild makes no guarantee that materials listed on the Platform will be available, meet your needs, or be delivered on any timeline. Donors may withdraw listings at any time. Recipients are responsible for coordinating pickup, delivery, or logistics directly with the donor.`,
  },
  {
    title: "7. Limitation of liability",
    body: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, CIRCULARBUILD, ITS OFFICERS, DIRECTORS, EMPLOYEES, VOLUNTEERS, ADVISORS, AND PARTNERS WILL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE, OR CONSEQUENTIAL DAMAGES (INCLUDING LOST PROFITS OR BUSINESS INTERRUPTION) ARISING OUT OF OR RELATED TO THE PLATFORM OR MATERIALS DONATED THROUGH THE PLATFORM. IF ANY LIABILITY IS FOUND DESPITE THIS DISCLAIMER, THAT LIABILITY WILL BE LIMITED TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW.`,
  },
  {
    title: "8. Indemnification",
    body: `You agree to indemnify, defend, and hold harmless CircularBuild, its officers, directors, employees, volunteers, advisors, and partners from and against any third-party claims, losses, damages, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of your access to or use of the Platform, your listings or requests, your handling or use of materials, or your violation of these terms or any applicable law.`,
  },
  {
    title: "9. Changes to the Platform or terms",
    body: `CircularBuild may modify, suspend, or discontinue the Platform at any time without notice. We may also update these Terms & Conditions periodically. The "Last updated" date below reflects the latest revision. Continued use of the Platform after changes go into effect constitutes acceptance of the revised terms.`,
  },
  {
    title: "10. Governing law",
    body: `These Terms & Conditions are governed by and construed in accordance with the laws of the United States and the state or jurisdiction in which CircularBuild is incorporated, without regard to conflict-of-laws principles.`,
  },
  {
    title: "Contact",
    body: `For questions about these terms, please reach out via the Contact page on the Platform.`,
  },
];

export type TermsSection = (typeof SECTIONS)[number];

export default function TermsPage() {
  return <TermsView sections={SECTIONS} lastUpdated="August 18, 2025" />;
}
