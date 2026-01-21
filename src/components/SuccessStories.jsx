"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { BiCheckCircle } from "react-icons/bi";
import { campaignService } from "@/services/campaignService";
import { getBackendBaseUrl } from "@/utils/api";

const COLOR_PRESETS = [
  "from-pink-500 to-rose-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-purple-500 to-fuchsia-500",
  "from-orange-500 to-amber-500",
  "from-teal-500 to-sky-500"
];

const formatCurrency = (amount) => {
  const value = Number(amount || 0);
  return value.toLocaleString("en-IN");
};

const getCampaignImageUrl = (campaign, backendBaseUrl) => {
  const images = Array.isArray(campaign?.images) ? campaign.images : [];
  const primary = images.find((img) => img?.isPrimary) || images[0];
  if (primary?.url) {
    return primary.url.startsWith("http")
      ? primary.url
      : `${backendBaseUrl}${primary.url.startsWith("/") ? "" : "/"}${primary.url}`;
  }
  return "/images/c1.jpg";
};

export default function SuccessStories() {
  const router = useRouter();
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const backendBaseUrl = useMemo(() => getBackendBaseUrl(), []);

  useEffect(() => {
    let isMounted = true;

    const fetchCompletedCampaigns = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const response = await campaignService.getCampaigns({
          status: "completed",
          limit: 6,
          sortBy: "-updatedAt"
        });
        const data = response?.data || response?.campaigns || [];
        if (isMounted) {
          setStories(data);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error?.message || "Failed to load success stories.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCompletedCampaigns();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-white via-purple-50 to-pink-50 px-2 relative border-y-2 border-purple-400">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500"></div>
      <div className="max-w-full mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Success Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real stories of hope, healing, and transformation powered by your generosity
          </p>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-600 mx-auto rounded-full" />
        </motion.div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {isLoading && (
            <div className="col-span-full text-center text-gray-600 py-12">
              Loading completed fundraisers...
            </div>
          )}
          {!isLoading && loadError && (
            <div className="col-span-full text-center text-red-600 py-12">
              {loadError}
            </div>
          )}
          {!isLoading && !loadError && stories.length === 0 && (
            <div className="col-span-full text-center text-gray-600 py-12">
              No completed fundraisers yet.
            </div>
          )}
          {!isLoading && !loadError && stories.map((story, index) => {
            const gradient = COLOR_PRESETS[index % COLOR_PRESETS.length];
            const imageUrl = getCampaignImageUrl(story, backendBaseUrl);
            return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group"
            >
              <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-200 hover:border-purple-300 group">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={story.title || "Completed fundraiser"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                  <div className={`absolute top-4 right-4 bg-gradient-to-r ${gradient} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5`}>
                    <BiCheckCircle className="text-base" />
                    <span>Completed Fundraised</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Category Badge */}
                  {story.category && (
                    <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                      {story.category}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {story.title || "Completed Fundraiser"}
                  </h3>

                  {/* Story */}
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {story.shortDescription || story.description || "A completed fundraiser created by our admin team."}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="text-center">
                      <p className={`text-lg font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                        {formatCurrency(story.currentAmount)}
                      </p>
                      <p className="text-xs text-gray-500">Raised</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {story.analytics?.donations || 0}
                      </p>
                      <p className="text-xs text-gray-500">Supporters</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(story.goalAmount)}
                      </p>
                      <p className="text-xs text-gray-500">Goal</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )})}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-center text-white shadow-2xl"
        >
          <div className="flex items-center justify-center mb-4">
            <FaHeart className="text-5xl animate-pulse" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            Be Part of the Next Success Story
          </h3>
          <p className="text-purple-100 text-lg mb-6 max-w-2xl mx-auto">
            Every donation makes a difference. Join thousands of changemakers and help create more success stories.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push("/campaigns")}
              className="bg-white text-purple-600 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-purple-200 hover:border-purple-400"
            >
              Donate to a Campaign
            </button>
            <button
              onClick={() => router.push("/create-fundraiser")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 border-white/30"
            >
              Start Your Campaign
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}






