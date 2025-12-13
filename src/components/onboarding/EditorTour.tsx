import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useEditorTour() {
  useEffect(() => {
    // Check if user has already seen the tour
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    
    if (hasSeenTour === 'true') {
      return; // Don't show tour if already seen
    }

    // Helper function to check if element exists
    const elementExists = (selector: string): boolean => {
      return document.querySelector(selector) !== null;
    };

    // Wait for elements to be available
    const waitForElements = (callback: () => void, maxAttempts = 10, attempt = 0) => {
      const requiredElements = ['#editor-panel', '#ats-scan-btn', '#export-btn'];
      const allExist = requiredElements.every(elementExists);

      if (allExist || attempt >= maxAttempts) {
        callback();
        return;
      }

      setTimeout(() => waitForElements(callback, maxAttempts, attempt + 1), 200);
    };

    // Start tour once elements are available
    waitForElements(() => {
      // Build steps array, conditionally including AI assistant button if it exists
      const steps: any[] = [
        {
          element: 'body',
          popover: {
            title: 'Welcome to SkillHoop!',
            description: "Let's build your resume. This quick tour will show you the key features.",
            side: 'bottom',
            align: 'center',
          },
        },
        {
          element: '#editor-panel',
          popover: {
            title: 'Editor Panel',
            description: 'Enter your details here. Use the left sidebar to add and edit your resume sections.',
            side: 'right',
            align: 'start',
          },
        },
      ];

      // Only add AI assistant step if the button exists (it appears when editing text fields)
      if (elementExists('#ai-assistant-btn')) {
        steps.push({
          element: '#ai-assistant-btn',
          popover: {
            title: 'Magic Wand',
            description: 'Use the Magic Wand to rewrite your text instantly. Click it next to any text field to improve, fix grammar, or make it more professional.',
            side: 'left',
            align: 'start',
          },
        });
      }

      // Add remaining steps
      steps.push(
        {
          element: '#ats-scan-btn',
          popover: {
            title: 'ATS Scanner',
            description: 'Check your resume against job descriptions here. The ATS Scanner helps ensure your resume passes applicant tracking systems.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#export-btn',
          popover: {
            title: 'Export',
            description: 'Download your resume as PDF or DOCX. Your resume is ready to share!',
            side: 'bottom',
            align: 'start',
          },
        }
      );

      const driverObj = driver({
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        steps,
        onDestroyStarted: () => {
          // Mark tour as seen when user closes it
          localStorage.setItem('hasSeenTour', 'true');
        },
        onDestroyed: () => {
          // Also mark as seen when tour completes
          localStorage.setItem('hasSeenTour', 'true');
        },
      });

      // Start the tour
      driverObj.drive();
    });
  }, []);
}

