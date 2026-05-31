import React from 'react';

/** Skeleton loading card — dùng trong grid sách */
const SkeletonCard = () => (
  <div className="sk-card">
    <div className="sk-img" />
    <div className="sk-body">
      <div className="sk-line sk-line-sm" />
      <div className="sk-line sk-line-lg" />
      <div className="sk-line sk-line-md" />
      <div className="sk-line sk-line-price" />
    </div>
  </div>
);

export default SkeletonCard;
