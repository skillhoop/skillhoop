const SunAnimation = () => {
  return (
    <>
      {/* --- Styles --- */}
      <style>{`
        /* MAIN SUN CONTAINER */
        .section-banner-sun {
          height: 300px;
          width: 300px;
          position: relative;
          transition: left 0.3s linear;
          z-index: 10;
        }

        /* SUN ORB & PULSING SHADOW 
           (Pseudo-element handles the rotation/pulse independent of the container) 
        */
        .section-banner-sun::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-color: #F8FAFC; /* Slate-50 */
          
          /* Rotating Rim Light (30s) + Pulse (5s) */
          animation: shadowPulse 5s ease-in-out infinite, sunRotate 30s linear infinite;
          
          box-shadow:
            0px 0px 40px 20px #E2E8F0, /* Slate-200 Outer Glow */
            -5px 0px 10px 1px #FFFFFF inset,
            15px 2px 40px 20px #94A3B840 inset, /* Slate-400 Transparent */
            -24px -2px 50px 25px #CBD5E1 inset, /* Slate-300 */
            150px 0px 80px 35px #47556940 inset; /* Slate-600 Transparent */
          
          z-index: -1; /* Ensure stars sit on top */
        }

        .curved-corner-star {
          display: flex;
          position: relative;
        }

        #curved-corner-bottomleft,
        #curved-corner-bottomright,
        #curved-corner-topleft,
        #curved-corner-topright {
          width: 4px;
          height: 5px;
          overflow: hidden;
          position: relative;
        }

        #curved-corner-bottomleft:before,
        #curved-corner-bottomright:before,
        #curved-corner-topleft:before,
        #curved-corner-topright:before {
          content: "";
          display: block;
          width: 200%;
          height: 200%;
          position: absolute;
          border-radius: 50%;
        }

        /* Updated Star Color to White to pop against the Slate */
        #curved-corner-bottomleft:before {
          bottom: 0;
          left: 0;
          box-shadow: -5px 5px 0 0 #FFFFFF;
        }

        #curved-corner-bottomright:before {
          bottom: 0;
          right: 0;
          box-shadow: 5px 5px 0 0 #FFFFFF;
        }

        #curved-corner-topleft:before {
          top: 0;
          left: 0;
          box-shadow: -5px -5px 0 0 #FFFFFF;
        }

        #curved-corner-topright:before {
          top: 0;
          right: 0;
          box-shadow: 5px -5px 0 0 #FFFFFF;
        }

        @keyframes twinkling {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 1; }
        }

        @keyframes sunRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        @keyframes shadowPulse {
          0%, 100% {
            box-shadow:
              0px 0px 40px 20px #E2E8F0,
              -5px 0px 10px 1px #FFFFFF inset,
              15px 2px 40px 20px #94A3B840 inset,
              -24px -2px 50px 25px #CBD5E1 inset,
              150px 0px 80px 35px #47556940 inset;
          }
          50% {
            box-shadow:
              0px 0px 60px 30px #CBD5E1,
              -5px 0px 20px 5px #FFFFFF inset,
              15px 2px 60px 30px #94A3B840 inset,
              -24px -2px 70px 35px #CBD5E1 inset,
              150px 0px 100px 45px #47556940 inset;
          }
        }

        /* Star positions */
        #star-1 { position: absolute; left: -20px; animation: twinkling 3s infinite; }
        #star-2 { position: absolute; left: -40px; top: 30px; animation: twinkling 2s infinite; }
        #star-3 { position: absolute; left: 350px; top: 90px; animation: twinkling 4s infinite; }
        #star-4 { position: absolute; left: 200px; top: 290px; animation: twinkling 3s infinite; }
        #star-5 { position: absolute; left: 50px; top: 270px; animation: twinkling 1.5s infinite; }
        #star-6 { position: absolute; left: 250px; top: -50px; animation: twinkling 4s infinite; }
        #star-7 { position: absolute; left: 290px; top: 60px; animation: twinkling 2s infinite; }
      `}</style>

      {/* --- Markup --- */}
      <div className="section-banner-sun">
        <div id="star-1">
          <div className="curved-corner-star">
            <div id="curved-corner-bottomright"></div>
            <div id="curved-corner-bottomleft"></div>
          </div>
          <div className="curved-corner-star">
            <div id="curved-corner-topright"></div>
            <div id="curved-corner-topleft"></div>
          </div>
        </div>

        <div id="star-2">
          <div className="curved-corner-star">
            <div id="curved-corner-bottomright"></div>
            <div id="curved-corner-bottomleft"></div>
          </div>
          <div className="curved-corner-star">
            <div id="curved-corner-topright"></div>
            <div id="curved-corner-topleft"></div>
          </div>
        </div>

        <div id="star-3">
          <div className="curved-corner-star">
            <div id="curved-corner-bottomright"></div>
            <div id="curved-corner-bottomleft"></div>
          </div>
          <div className="curved-corner-star">
            <div id="curved-corner-topright"></div>
            <div id="curved-corner-topleft"></div>
          </div>
        </div>

        <div id="star-4">
          <div className="curved-corner-star">
            <div id="curved-corner-bottomright"></div>
            <div id="curved-corner-bottomleft"></div>
          </div>
          <div className="curved-corner-star">
            <div id="curved-corner-topright"></div>
            <div id="curved-corner-topleft"></div>
          </div>
        </div>

        <div id="star-5">
          <div className="curved-corner-star">
            <div id="curved-corner-bottomright"></div>
            <div id="curved-corner-bottomleft"></div>
          </div>
          <div className="curved-corner-star">
            <div id="curved-corner-topright"></div>
            <div id="curved-corner-topleft"></div>
          </div>
        </div>

        <div id="star-6">
          <div className="curved-corner-star">
            <div id="curved-corner-bottomright"></div>
            <div id="curved-corner-bottomleft"></div>
          </div>
          <div className="curved-corner-star">
            <div id="curved-corner-topright"></div>
            <div id="curved-corner-topleft"></div>
          </div>
        </div>

        <div id="star-7">
          <div className="curved-corner-star">
            <div id="curved-corner-bottomright"></div>
            <div id="curved-corner-bottomleft"></div>
          </div>
          <div className="curved-corner-star">
            <div id="curved-corner-topright"></div>
            <div id="curved-corner-topleft"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SunAnimation;

