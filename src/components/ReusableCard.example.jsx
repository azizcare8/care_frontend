/**
 * ReusableCard Component Usage Examples
 * 
 * This component can be used in both backend (admin) and frontend
 */

import ReusableCard from './ReusableCard';

// Example 1: Basic Card
export function BasicCardExample() {
  return (
    <ReusableCard
      title="Card Title"
      description="This is a basic card description"
      image="/path/to/image.jpg"
    />
  );
}

// Example 2: Card with Link
export function CardWithLinkExample() {
  return (
    <ReusableCard
      title="Clickable Card"
      description="This card is clickable and navigates to a page"
      image="/path/to/image.jpg"
      link="/partners/health/123"
    />
  );
}

// Example 3: Card with Gradient Variant
export function GradientCardExample() {
  return (
    <ReusableCard
      title="Gradient Card"
      description="Beautiful gradient background card"
      image="/path/to/image.jpg"
      variant="gradient"
    />
  );
}

// Example 4: Card with Badge and Footer
export function CardWithBadgeExample() {
  return (
    <ReusableCard
      title="Featured Partner"
      description="This is a featured partner card"
      image="/path/to/image.jpg"
      variant="elevated"
      badge={
        <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
          Featured
        </span>
      }
      footer={
        <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          View Details
        </button>
      }
    />
  );
}

// Example 5: Small Card
export function SmallCardExample() {
  return (
    <ReusableCard
      title="Small Card"
      description="Compact card for lists"
      image="/path/to/image.jpg"
      size="sm"
    />
  );
}

// Example 6: Card with Custom Content
export function CardWithCustomContentExample() {
  return (
    <ReusableCard
      title="Custom Content Card"
      description="Card with additional custom content"
      image="/path/to/image.jpg"
    >
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">Rating: 4.5</span>
        <span className="text-sm font-semibold text-green-600">500</span>
      </div>
    </ReusableCard>
  );
}

// Example 7: Card with onClick Handler
export function CardWithClickExample() {
  const handleClick = () => {
    console.log('Card clicked!');
  };

  return (
    <ReusableCard
      title="Clickable Card"
      description="Card with custom click handler"
      image="/path/to/image.jpg"
      onClick={handleClick}
    />
  );
}

// Example 8: Card without Hover Effect
export function StaticCardExample() {
  return (
    <ReusableCard
      title="Static Card"
      description="Card without hover effects"
      image="/path/to/image.jpg"
      hover={false}
    />
  );
}

