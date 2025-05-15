import type { Route } from "../+types/route";
import { motion, type Variants } from "framer-motion";
import { useState } from "react";
import { Link, useNavigation, useViewTransitionState } from "react-router";
import { getIgdbImageUrl } from "~/lib/igdb";

interface GameCardProps {
  game: Route.ComponentProps["loaderData"][number];
}

export function GameCard({ game }: GameCardProps) {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const to = `/games/${game.id}`;
  const isTransitioning = useViewTransitionState(to);

  // ナビゲーションの状態を取得
  const navigation = useNavigation();
  // このカードに関連するナビゲーションが進行中かどうかを確認
  const isNavigating =
    navigation.state !== "idle" &&
    navigation.location &&
    navigation.location.pathname === to;

  // カードの回転アニメーション
  const flipVariants = {
    front: {
      rotateY: 0,
      transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] },
    },
    back: {
      rotateY: 180,
      transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] },
    },
  };

  // 輪郭が光るパルスエフェクト用のvariants
  const pulseOutlineVariants: Variants = {
    idle: {
      boxShadow: "0 0 0 0px rgba(59, 130, 246, 0)",
    },
    navigating: {
      boxShadow: [
        "0 0 0 0px rgba(99, 102, 241, 0)",
        "0 0 0 4px rgba(99, 102, 241, 0.7)",
        "0 0 0 0px rgba(99, 102, 241, 0)",
      ],
      transition: {
        repeat: Number.POSITIVE_INFINITY,
        duration: 1,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className="h-96 w-72 cursor-pointer rounded-xl"
      style={{ perspective: "1000px" }}
      animate={isNavigating ? "navigating" : "idle"}
      variants={pulseOutlineVariants}
    >
      <Link
        to={to}
        viewTransition
        className="block h-full w-full"
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
        prefetch="intent"
      >
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          animate={isFlipped ? "back" : "front"}
          variants={flipVariants}
        >
          {/* カード表面 */}
          <div
            className="absolute flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 shadow-lg"
            style={{ backfaceVisibility: "hidden" }}
          >
            <h2 className="line-clamp-4 text-center text-2xl font-bold text-white">
              {game.summary || game.name}
            </h2>
          </div>

          {/* カード裏面 */}
          <div
            className="absolute h-full w-full overflow-hidden rounded-xl shadow-lg"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              viewTransitionName: isTransitioning
                ? `game-cover-${game.id}`
                : "",
            }}
          >
            {game.cover?.image_id ? (
              <img
                src={getIgdbImageUrl(game.cover?.image_id, "cover_big_2x")}
                alt={game.name}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            ) : (
              game.japanName
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
