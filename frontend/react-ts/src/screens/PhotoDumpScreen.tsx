import { useMemo, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { AnimatePresence, motion } from "framer-motion";
import { CameraIcon, ChevronLeft, ChevronRight, CloseIcon } from "../components/icons";
import { ImageSwiper } from "@/components/ui/image-swiper";
import type { Photo } from "../types";
import { cn } from "../lib/cn";
import { auth } from "@/firebase";
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export function PhotoDumpScreen() {
  const photos: any = []
  //const { photos, addPhoto } = useApp();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [cameraDate, setCameraDate] = useState<string | null>(null);
  const [viewerDate, setViewerDate] = useState<string | null>(null);
  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate());

  

  // map date -> photos that day
  const byDate = useMemo(() => {
    const map = new Map<string, typeof photos>();
    for (const p of photos) {
      const arr = map.get(p.date) ?? [];
      arr.push(p);
      map.set(p.date, arr);
    }
    return map;
  }, [photos]);

  const sendImageViaFlask = async (formData: FormData) => {
    const token = await auth.currentUser?.getIdToken(); 
    const data = await fetch(`${import.meta.env.VITE_API_URL}/api/sendImage`, {
      method: 'POST', 
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    const response = data.json()
    console.log(response);
  }

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shift = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
  };

  return (
    <>
    <div className="flex flex-1 flex-col px-[18px] pb-8">
      {/* month header */}
      <div className="my-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => shift(-1)} className="glass grid h-9 w-9 place-items-center rounded-xl active:brightness-125">
            <ChevronLeft width={18} height={18} />
          </button>
          <button onClick={() => shift(1)} className="glass grid h-9 w-9 place-items-center rounded-xl active:brightness-125">
            <ChevronRight width={18} height={18} />
          </button>
        </div>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="text-center text-[11px] text-faint">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="aspect-square" />;
          const date = iso(year, month, day);
          const dayPhotos = byDate.get(date);
          const cover = dayPhotos?.[0];
          return (
            <button
              key={i}
              onClick={() => (dayPhotos?.length ? setViewerDate(date) : setCameraDate(date))}
              className={cn(
                "relative grid aspect-square place-items-center overflow-hidden rounded-xl border bg-white/5 text-[12px] text-muted transition active:scale-95",
                date === todayIso ? "border-rose-soft" : "border-white/10",
                cover && "bg-cover bg-center text-white",
              )}
              style={cover ? { backgroundImage: `url(${cover.dataUrl})` } : undefined}
            >
              {cover ? (
                <>
                  <span className="absolute left-1 top-0.5 text-[10px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{day}</span>
                  {(dayPhotos?.length ?? 0) > 1 && (
                    <span className="absolute bottom-0.5 right-1 rounded bg-black/55 px-1 text-[9px]">
                      {dayPhotos?.length}
                    </span>
                  )}
                </>
              ) : (
                day
              )}
            </button>
          );
        })}
      </div>

      {/* camera FAB -> capture for today */}
      <button
        onClick={() => setCameraDate(todayIso)}
        className="glass-rose sticky bottom-6 mt-6 grid h-16 w-16 place-items-center self-center rounded-full text-white active:scale-95"
        aria-label="Open camera"
      >
        <CameraIcon width={26} height={26} />
      </button>

      <AnimatePresence>
        {cameraDate && (
          <CameraSheet
            date={cameraDate}
            onClose={() => setCameraDate(null)}
            onCapture={(blob, caption) => {
              //addPhoto(dataUrl, cameraDate, caption);
              const formData = new FormData();
              formData.append("image", blob, "myfile.jpeg")
              formData.append("date", cameraDate)
              if (caption) {
                formData.append("caption", caption)
              }
              sendImageViaFlask(formData)
              setCameraDate(null);
            }}
          />
        )}
        {viewerDate && (
          <ViewerSheet
            date={viewerDate}
            photos={byDate.get(viewerDate) ?? []}
            onClose={() => setViewerDate(null)}
            onAdd={() => {
              const d = viewerDate;
              setViewerDate(null);
              setCameraDate(d);
            }}
          />
        )}
      </AnimatePresence>
    </div>

    
    {/* this is the testing ground */}
    
    <div> List of Photos </div>

    {/* this is the end of the testing ground */}
    </>
  );
}

function prettyDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function ViewerSheet({
  date,
  photos,
  onClose,
  onAdd,
}: {
  date: string;
  photos: Photo[];
  onClose: () => void;
  onAdd: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-[480px] rounded-t-3xl border border-white/10 bg-ink-1 px-[18px] pb-7 pt-4.5"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[17px] font-bold">{prettyDate(date)}</h2>
          <button onClick={onClose} className="text-muted active:text-cream">
            <CloseIcon width={22} height={22} />
          </button>
        </div>

        <div className="grid place-items-center py-2">
          <ImageSwiper
            images={photos.map((p) => p.dataUrl)}
            cardWidth={260}
            cardHeight={340}
          />
        </div>

        <p className="mb-3 text-center text-[12px] text-faint">
          {photos.length > 1 ? "Swipe to browse · " : ""}
          {photos.length} {photos.length === 1 ? "memory" : "memories"}
        </p>

        <button
          onClick={onAdd}
          className="glass-rose flex w-full items-center justify-center gap-2 rounded-xl py-3 text-[15px] font-semibold text-white active:scale-[0.98]"
        >
          <CameraIcon width={20} height={20} />
          Add another
        </button>
      </motion.div>
    </motion.div>
  );
}

function CameraSheet({
  date,
  onClose,
  onCapture,
}: {
  date: string;
  onClose: () => void;
  onCapture: (blob: Blob, caption?: string) => void;
}) {
  const webcamRef = useRef<Webcam>(null);
  const [shot, setShot] = useState< Blob | null>(null);  // this is where I attach the image
  const [caption, setCaption] = useState("");
  const [err, setErr] = useState(false);

  // setShot updates only after the end of the function
  const capture = useCallback(async () => {
    const img = webcamRef.current?.getScreenshot();
    if (!img )return;
    const blob = await(await fetch(img)).blob()
    if(!img) return; 
    setShot(blob); 
    
    console.log(blob)
  }, []);

  const pretty = new Date(date + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      
      <motion.div
        className="w-full max-w-[480px] rounded-t-3xl border border-white/10 bg-ink-1 px-[18px] pb-7 pt-4.5"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-bold">{pretty}</h2>
          <button onClick={onClose} className="text-muted active:text-cream">
            <CloseIcon width={22} height={22} />
          </button>
          
        </div>

        
        {shot ? (
          <img src={URL.createObjectURL(shot)} alt="preview" className="aspect-[3/4] w-full rounded-2xl object-cover" />
        ) : err ? (
          <div className="grid aspect-[3/4] w-full place-items-center rounded-2xl bg-black/60 px-6 text-center text-sm text-muted">
            Camera unavailable. Allow camera access in your browser to add photos.
          </div>
        ) : (
          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "user" }}
            onUserMediaError={() => setErr(true)}
            className="aspect-[3/4] w-full rounded-2xl object-cover"
          />
        )}

        {shot && (
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption…"
            className="mt-3 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-[15px] outline-none focus:border-rose-soft"
          />
        )}

        <div className="mt-3.5 flex gap-2.5">
          {shot ? (
            <>
              <button
                onClick={() => setShot(null)}
                className="glass flex-1 rounded-xl py-3 text-[15px] font-semibold active:scale-[0.98]"
              >
                Retake
              </button>
              <button
                onClick={() => onCapture(shot, caption.trim() || undefined)}
                className="glass-mint flex-1 rounded-xl py-3 text-[15px] font-semibold text-white active:scale-[0.98]"
              >
                Save
              </button>
            </>
          ) : (
            <button
              disabled={err}
              onClick={capture}
              className="glass-rose flex-1 rounded-xl py-3 text-[15px] font-semibold text-white active:scale-[0.98] disabled:opacity-40"
            >
              Capture
            </button>
          )}
          
        </div>

        
      </motion.div>
      
    </motion.div>
    
  );
}
