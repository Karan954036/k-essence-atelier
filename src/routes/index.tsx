import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Hero } from "@/components/home/Hero";
import {
  BestSellersSection,
  FeaturedCollections,
  FragranceExperience,
  NewArrivalsSection,
  NewsletterSection,
  PremiumAttarsSection,
  ReviewsSection,
  SignaturePerfumesSection,
  StorySection,
  WhySection,
} from "@/components/home/sections";

const title = "K ESSENCE — Luxury Perfumes & Premium Attars";
const description =
  "K ESSENCE is a perfume and attar house crafting oud, sandalwood, rose and musk compositions. Explore signature perfumes, premium attars and gifting.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteShell>
      <Hero />
      <FeaturedCollections />
      <BestSellersSection />
      <SignaturePerfumesSection />
      <PremiumAttarsSection />
      <FragranceExperience />
      <StorySection />
      <NewArrivalsSection />
      <WhySection />
      <ReviewsSection />
      <NewsletterSection />
    </SiteShell>
  );
}
