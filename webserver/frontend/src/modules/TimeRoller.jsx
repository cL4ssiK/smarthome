import { useRef, useEffect, useCallback} from "react";
import styles from "./TimeRoller.module.css";

/**
 * Infinite scroller, made mostly using google gemini. it works, but im quite certain
 * this can be improved a lot. a bit hacky solution, but I dont want to spend too much time on this for now.
 * !!REVISIT THIS!!!
 * @param {*} param0 
 * @returns 
 */
function TimeRoller({options, onSelect}) {
    const scrollRef = useRef(null);
    const lastIndex = useRef(null);
    const itemHeight = 40; // Must match CSS
  
    // Triple the options to create the illusion of a loop
    const doubledOptions = [...options, ...options, ...options];
    const midpoint = options.length * itemHeight;

    const friction = 0.4; // 1.0 is normal, 0.1 is very heavy/slow

    const handleWheel = (e) => {
        if (scrollRef.current) {
            // We prevent the browser's default fast scroll
            e.preventDefault();

            // We move the scrollbar ourselves, but only at 40% speed
            scrollRef.current.scrollTop += e.deltaY * friction;
        }
    };

    // Use useEffect to add the listener with { passive: false } 
    // so preventDefault works.
    useEffect(() => {
        const node = scrollRef.current;
        if (node) {
            node.addEventListener("wheel", handleWheel, { passive: false });
            return () => node.removeEventListener("wheel", handleWheel);
        }
    }, []);

    // 1. Initial Position: Start in the middle set
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = midpoint;
        }
    }, [midpoint]);

    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;

        const scrollTop = scrollRef.current.scrollTop;
        //console.log(scrollTop, scrollTop / 40);

        // 2. The "Teleport" Logic
        // If they scroll too high, jump to the middle
        if (scrollTop < midpoint - (options.length / 2) * itemHeight) {
            scrollRef.current.scrollTop = scrollTop + midpoint;
            return;
        } 
        // If they scroll too low, jump to the middle
        else if (scrollTop > midpoint + (options.length / 2) * itemHeight) {
            scrollRef.current.scrollTop = scrollTop - midpoint;
            return;
        }

        // 3. Report the selected value
        const index = Math.round(scrollTop / itemHeight) % options.length;
        if (index !== lastIndex.current) {
            lastIndex.current = index;
            onSelect(options[index]);
        }
    }, [midpoint, options, itemHeight, onSelect]);

    return (
        <div className={styles.rollercontainer} ref={scrollRef} onScroll={handleScroll}>
            {/* Invisible padding to allow the first/last items to center */}
            <div className={styles.rollerpadding} />
        
            {doubledOptions.map((opt, i) => (
                <div key={i} className={styles.rolleritem}>
                {opt}
                </div>
            ))}

            <div className={styles.rollerpadding} />
            {/* The Selection Highlight Box */}
            <div className={styles.rollerselectionoverlay} />
        </div>
  );
}

export { TimeRoller };