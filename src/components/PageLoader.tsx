import React, { useEffect, useRef } from 'react';
import '../styles/page-loader.css';

interface PageLoaderProps {
  isLoading?: boolean;
  brand?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  isLoading = false,
  brand = 'CleanTrack' 
}) => {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loaderRef.current) {
      if (isLoading) {
        loaderRef.current.classList.remove('hide');
      } else {
        loaderRef.current.classList.add('hide');
      }
    }
  }, [isLoading]);

  return (
    <div id="page-loader" className={isLoading ? '' : 'hide'} ref={loaderRef}>
      <div className="droplet-loader">
        <div className="droplet"></div>
        <div className="droplet-shadow"></div>
        <div className="sparkle sparkle1"></div>
        <div className="sparkle sparkle2"></div>
        <div className="sparkle sparkle3"></div>
      </div>
      {brand && <div className="loader-brand">{brand}</div>}
    </div>
  );
};

// Create a standalone instance for imperative calls
let loaderInstance: HTMLDivElement | null = null;

// Function to initialize the loader once
export const initPageLoader = (): void => {
  if (!loaderInstance && typeof document !== 'undefined') {
    loaderInstance = document.createElement('div');
    loaderInstance.id = 'page-loader';
    
    const dropletLoader = document.createElement('div');
    dropletLoader.className = 'droplet-loader';
    
    const droplet = document.createElement('div');
    droplet.className = 'droplet';
    
    const dropletShadow = document.createElement('div');
    dropletShadow.className = 'droplet-shadow';
    
    const sparkle1 = document.createElement('div');
    sparkle1.className = 'sparkle sparkle1';
    
    const sparkle2 = document.createElement('div');
    sparkle2.className = 'sparkle sparkle2';
    
    const sparkle3 = document.createElement('div');
    sparkle3.className = 'sparkle sparkle3';
    
    const brand = document.createElement('div');
    brand.className = 'loader-brand';
    brand.textContent = 'CleanTrack';
    
    dropletLoader.appendChild(droplet);
    dropletLoader.appendChild(dropletShadow);
    dropletLoader.appendChild(sparkle1);
    dropletLoader.appendChild(sparkle2);
    dropletLoader.appendChild(sparkle3);
    
    loaderInstance.appendChild(dropletLoader);
    loaderInstance.appendChild(brand);
    
    document.body.appendChild(loaderInstance);
  }
};

// Function to show the loader
export const showLoader = (): void => {
  if (!loaderInstance) {
    initPageLoader();
  }
  
  if (loaderInstance) {
    loaderInstance.classList.remove('hide');
  }
};

// Function to hide the loader
export const hideLoader = (): void => {
  if (loaderInstance) {
    loaderInstance.classList.add('hide');
  }
};

export default PageLoader; 