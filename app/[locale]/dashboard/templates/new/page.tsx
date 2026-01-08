"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  FileText,
  Upload,
  Crown,
  Gift,
  Star,
  Info,
} from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function AddTemplatePage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("dashboard.templates");
  const isArabic = locale === "ar";

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    price: "",
    oldPrice: "",
    category: "",
    videoUrl: "",
    thumbnail: "",
    fileUrl: "",
    fileName: "",
    fileSize: "",
    fileType: "pptx",
    slides: "",
    aspectRatio: "16:9",
    tags: "",
    isFeatured: false,
    isActive: true,
    isFree: false,
    rating: "5",
    metaTitle: "",
    metaDescription: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [previewVideo, setPreviewVideo] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || data.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === "isFree" && checked) {
      setFormData((prev) => ({
        ...prev,
        isFree: true,
        price: "0",
        oldPrice: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const addImageUrl = () => {
    setImages((prev) => [...prev, ""]);
  };

  const updateImageUrl = (index: number, url: string) => {
    setImages((prev) => prev.map((img, i) => (i === index ? url : img)));
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(
      /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandboxplaylist\?v=|\S+\?v=))([^\/&\n\s]+)/
    );
    if (videoId && videoId[1]) {
      return `https://www.youtube.com/embed/${videoId[1]}`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Find category name
      const selectedCategory = categories.find((c) => c._id === formData.category);
      if (!selectedCategory) {
        throw new Error("Please select a category");
      }

      // Prepare data
      const templateData = {
        ...formData,
        price: formData.isFree ? 0 : parseFloat(formData.price) || 0,
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
        slides: formData.slides ? parseInt(formData.slides) : undefined,
        rating: parseFloat(formData.rating) || 5,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        images: images.filter(Boolean).map((url, index) => ({
          url,
          alt: formData.name,
          order: index,
        })),
        categoryName: selectedCategory.name,
      };

      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create template");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/dashboard/templates`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  const InputLabel = ({ children, required, hint }: { children: React.ReactNode; required?: boolean; hint?: string }) => (
    <div className="flex items-center justify-between mb-2">
      <label className="text-sm font-medium text-gray-300">
        {children}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {hint && (
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {hint}
        </span>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/${locale}/dashboard/templates`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          {isArabic ? <ArrowLeft className="w-4 h-4 rotate-180" /> : <ArrowLeft className="w-4 h-4" />}
          {t("backToTemplates") || "Back to Templates"}
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {t("addTemplate") || "Add New Template"}
            </h1>
            <p className="text-sm text-gray-400">
              {t("addTemplateSubtitle") || "Create a new template for your store"}
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300">
              {t("createSuccess") || "Template created successfully! Redirecting..."}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300 flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-surface-card rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-400" />
            {t("basicInfo") || "Basic Information"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <InputLabel required>{t("templateName") || "Template Name"}</InputLabel>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                placeholder={t("templateNamePlaceholder") || "Professional Business Presentation"}
              />
            </div>

            <div>
              <InputLabel required hint={t("slugHint") || "URL-friendly name"}>{t("slug") || "Slug"}</InputLabel>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all font-mono text-sm"
                placeholder="professional-business-presentation"
              />
            </div>

            <div>
              <InputLabel required>{t("category") || "Category"}</InputLabel>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
              >
                <option value="">{t("selectCategory") || "Select Category"}</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <InputLabel>{t("shortDescription") || "Short Description"}</InputLabel>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                maxLength={200}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                placeholder={t("shortDescriptionPlaceholder") || "Brief description for cards (max 200 chars)"}
              />
            </div>

            <div className="md:col-span-2">
              <InputLabel required>{t("fullDescription") || "Full Description"}</InputLabel>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all resize-none"
                placeholder={t("fullDescriptionPlaceholder") || "Detailed description of the template..."}
              />
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-surface-card rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            {t("pricing") || "Pricing"}
          </h2>

          {/* Free/Premium Toggle */}
          <div className="mb-6 p-4 bg-black/30 rounded-xl border border-white/10">
            <label className="flex items-center gap-4 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-600 rounded-full peer peer-checked:bg-green-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full peer-checked:translate-x-7 transition-transform" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {formData.isFree ? (
                    <Gift className="w-5 h-5 text-green-400" />
                  ) : (
                    <Crown className="w-5 h-5 text-yellow-400" />
                  )}
                  <span className="font-semibold text-white">
                    {formData.isFree ? (t("freeTemplate") || "Free Template") : (t("premiumTemplate") || "Premium Template")}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {formData.isFree
                    ? (t("freeTemplateDesc") || "This template will be available for free download")
                    : (t("premiumTemplateDesc") || "This template requires payment to download")}
                </p>
              </div>
            </label>
          </div>

          {/* Price inputs */}
          <AnimatePresence>
            {!formData.isFree && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden"
              >
                <div>
                  <InputLabel required>{t("price") || "Price (EGP)"}</InputLabel>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required={!formData.isFree}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                    placeholder="99.99"
                  />
                </div>

                <div>
                  <InputLabel hint={t("oldPriceHint") || "Shows as crossed out"}>{t("oldPrice") || "Old Price (EGP)"}</InputLabel>
                  <input
                    type="number"
                    name="oldPrice"
                    value={formData.oldPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                    placeholder="149.99"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Media Section */}
        <div className="bg-surface-card rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-400" />
            {t("media") || "Media"}
          </h2>

          <div className="space-y-6">
            {/* Cover Image */}
            <div>
              <InputLabel required>{t("coverImage") || "Cover Image URL"}</InputLabel>
              <div className="flex gap-4">
                <input
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                  placeholder="https://..."
                />
                {formData.thumbnail && (
                  <div className="relative w-20 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                    <Image src={formData.thumbnail} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Video URL */}
            <div>
              <InputLabel hint={t("videoHint") || "YouTube embed"}>{t("videoUrl") || "Video URL (YouTube)"}</InputLabel>
              <div className="flex gap-4">
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                  placeholder="https://youtube.com/watch?v=..."
                />
                {formData.videoUrl && getYouTubeEmbedUrl(formData.videoUrl) && (
                  <button
                    type="button"
                    onClick={() => setPreviewVideo(!previewVideo)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors flex items-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    {previewVideo ? (t("hidePreview") || "Hide") : (t("preview") || "Preview")}
                  </button>
                )}
              </div>
              
              {/* Video Preview */}
              <AnimatePresence>
                {previewVideo && formData.videoUrl && getYouTubeEmbedUrl(formData.videoUrl) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
                      <iframe
                        src={getYouTubeEmbedUrl(formData.videoUrl) || ""}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Gallery Images */}
            <div>
              <InputLabel>{t("galleryImages") || "Gallery Images"}</InputLabel>
              <div className="space-y-3">
                {images.map((url, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateImageUrl(index, e.target.value)}
                      className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                      placeholder="https://..."
                    />
                    {url && (
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                        <Image src={url} alt={`Gallery ${index + 1}`} fill className="object-cover" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageUrl}
                  className="inline-flex items-center gap-2 px-4 py-3 text-primary-400 hover:bg-primary-500/10 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t("addImage") || "Add Image"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Template File */}
        <div className="bg-surface-card rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5 text-green-400" />
            {t("templateFile") || "Template File"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <InputLabel required>{t("fileUrl") || "File URL"}</InputLabel>
              <input
                type="url"
                name="fileUrl"
                value={formData.fileUrl}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                placeholder="https://drive.google.com/..."
              />
            </div>

            <div>
              <InputLabel required>{t("fileName") || "File Name"}</InputLabel>
              <input
                type="text"
                name="fileName"
                value={formData.fileName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                placeholder="template.pptx"
              />
            </div>

            <div>
              <InputLabel>{t("fileType") || "File Type"}</InputLabel>
              <select
                name="fileType"
                value={formData.fileType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
              >
                <option value="pptx">PPTX</option>
                <option value="ppt">PPT</option>
                <option value="key">Keynote</option>
                <option value="pdf">PDF</option>
                <option value="zip">ZIP</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <InputLabel>{t("fileSize") || "File Size"}</InputLabel>
              <input
                type="text"
                name="fileSize"
                value={formData.fileSize}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                placeholder="15 MB"
              />
            </div>

            <div>
              <InputLabel>{t("slides") || "Number of Slides"}</InputLabel>
              <input
                type="number"
                name="slides"
                value={formData.slides}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                placeholder="30"
              />
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="bg-surface-card rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            {t("additionalSettings") || "Additional Settings"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <InputLabel>{t("aspectRatio") || "Aspect Ratio"}</InputLabel>
              <select
                name="aspectRatio"
                value={formData.aspectRatio}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
              >
                <option value="16:9">16:9 (Widescreen)</option>
                <option value="4:3">4:3 (Standard)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="A4">A4</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <InputLabel>{t("rating") || "Initial Rating"}</InputLabel>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="flex-1 accent-primary-500"
                />
                <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-semibold">{parseFloat(formData.rating).toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <InputLabel>{t("tags") || "Tags (comma separated)"}</InputLabel>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                placeholder="business, modern, minimal, professional"
              />
            </div>

            {/* Status toggles */}
            <div className="md:col-span-2 flex flex-wrap gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-600 rounded-full peer peer-checked:bg-green-500 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-6 transition-transform" />
                </div>
                <span className="text-gray-300 font-medium">{t("active") || "Active"}</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-600 rounded-full peer peer-checked:bg-yellow-500 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-6 transition-transform" />
                </div>
                <span className="text-gray-300 font-medium">{t("featured") || "Featured"}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <Link
            href={`/${locale}/dashboard/templates`}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors text-center"
          >
            {t("cancel") || "Cancel"}
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-black font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("creating") || "Creating..."}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t("createTemplate") || "Create Template"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
