"use client";
import Image from "next/image";
import Link from "next/link";

/**
 * Reusable Card Component
 * Works for both backend (admin) and frontend
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string} props.description - Card description
 * @param {string} props.image - Image URL
 * @param {string} props.link - Optional link URL
 * @param {string} props.variant - 'default' | 'gradient' | 'elevated' | 'bordered'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {React.ReactNode} props.children - Additional content
 * @param {Function} props.onClick - Click handler
 * @param {Object} props.className - Additional classes
 */
export default function ReusableCard({
  title,
  description,
  image,
  link,
  variant = "default",
  size = "md",
  children,
  onClick,
  className = "",
  imageAlt = "",
  badge,
  footer,
  hover = true
}) {
  const baseClasses = "rounded-2xl transition-all duration-300 overflow-hidden";
  
  const variantClasses = {
    default: "bg-white shadow-lg border border-gray-200",
    gradient: "bg-gradient-to-br from-green-50 via-blue-50 to-green-50 shadow-xl border-2 border-green-200",
    elevated: "bg-white shadow-2xl border border-gray-100",
    bordered: "bg-white border-2 border-gray-300 shadow-md"
  };

  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  const hoverClasses = hover ? "hover:shadow-2xl hover:scale-[1.02] cursor-pointer" : "";

  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${hoverClasses} ${className}`;

  const imageSizes = {
    sm: "h-32",
    md: "h-48",
    lg: "h-64"
  };

  const CardContent = (
    <div className={`${cardClasses} relative`} onClick={onClick}>
      {/* Badge */}
      {badge && (
        <div className="absolute top-4 right-4 z-10">
          {badge}
        </div>
      )}

      {/* Image */}
      {image && (
        <div className={`relative w-full ${imageSizes[size]} mb-4 rounded-xl overflow-hidden`}>
          <Image
            src={image}
            alt={imageAlt || title || "Card image"}
            fill
            className="object-cover transition-transform duration-300 hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {variant === "gradient" && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        {title && (
          <h3 className={`font-bold text-gray-900 ${
            size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl"
          }`}>
            {title}
          </h3>
        )}
        
        {description && (
          <p className={`text-gray-600 ${
            size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"
          } line-clamp-3`}>
            {description}
          </p>
        )}

        {/* Children content */}
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );

  // Wrap with Link if link is provided
  if (link) {
    return (
      <Link href={link} className="block">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
}

