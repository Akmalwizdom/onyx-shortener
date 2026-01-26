import { motion } from 'framer-motion';
import { type Link as ArchiveLink } from '@/hooks/useArchive';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { useToast } from '@/context/ToastContext';

interface HistoryListProps {
  links: ArchiveLink[] | undefined;
  isLoading: boolean;
  isLoadingMore: boolean;
  isReachingEnd: boolean;
  setSize: (size: number | ((_size: number) => number)) => Promise<unknown>;
  size: number;
}

export function HistoryList({
  links,
  isLoading,
  isLoadingMore,
  isReachingEnd,
  setSize,
  size
}: HistoryListProps) {
  const { showToast } = useToast();

  if (isLoading && !links) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
           <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  if (!links || links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/30">
        <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
        <p className="font-mono text-xs">NO ARCHIVED LINKS</p>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/** Mobile Header - Only visible on mobile list view **/}
        <div className="md:hidden col-span-1 pb-2">
           <h3 className="text-primary text-xs font-mono font-bold tracking-widest uppercase">Recent Activity</h3>
        </div>

        {links.map((link) => (
          <motion.div
            key={link.id}
            variants={fadeInUp}
            className="group relative flex flex-col justify-between p-4 rounded-xl bg-black/40 border border-white/10 hover:border-primary/50 transition-all min-h-[160px]"
          >
            {/* Top Status Bar (Unified) */}
            <div className="flex justify-between items-start mb-2">
               <span className="text-[10px] font-mono text-primary font-bold tracking-widest uppercase">Active</span>
               <a 
                 href={link.shortUrl} 
                 target="_blank" 
                 rel="noopener"
                 className="flex items-center justify-center hover:scale-110 transition-transform"
                 title="Open Link"
               >
                  <span className="material-symbols-outlined text-primary/50 text-xs hover:text-primary transition-colors">arrow_outward</span>
               </a>
            </div>

            <div className="flex-1 flex flex-col justify-center my-2">
               {/* URL Display */}
               <div className="mb-1">
                 <p className="font-mono text-primary text-lg font-bold truncate tracking-tight">
                    {link.shortUrl.replace(/^https?:\/\//, '')}
                 </p>
                 <p className="font-mono text-[10px] text-white/30 truncate mt-1">
                    {link.originalUrl}
                 </p>
               </div>
            </div>

            {/* Footer Info (Unified) */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <span className="text-[10px] font-mono text-white/30">
                    {new Date(link.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                    <button 
                        onClick={() => {
                             navigator.clipboard.writeText(link.shortUrl);
                             showToast('COPIED TO CLIPBOARD', 'success');
                        }}
                        className="text-white/30 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">content_copy</span>
                    </button>
                    <button 
                        onClick={async () => {
                            if (navigator.share) {
                                try {
                                    await navigator.share({
                                        title: 'Onyx Short Link',
                                        text: `Check out this link: ${link.originalUrl}`,
                                        url: link.shortUrl
                                    });
                                } catch (err) {
                                    console.error('Share failed:', err);
                                }
                            } else {
                                navigator.clipboard.writeText(link.shortUrl);
                                showToast('COPIED TO CLIPBOARD', 'success');
                            }
                        }}
                        className="text-white/30 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">share</span>
                    </button>
                </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Load More Link */}
      {/* Infinite Scroll Trigger */}
      {!isReachingEnd && (
         <motion.div 
           onViewportEnter={() => {
              if (!isLoadingMore) {
                setSize(size + 1);
              }
           }}
           className="flex justify-center pt-8 pb-20"
         >
            <div className="flex items-center gap-2 px-6 py-2 rounded text-primary/50 font-mono text-xs">
                {isLoadingMore && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }}/>
                    <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }}/>
                    <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }}/>
                  </>
                )}
            </div>
         </motion.div>
      )}
    </>
  );
}
