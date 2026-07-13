"use client";

export default function StarRating({
    rating = 0,
    size = "md",
    interactive = false,
    onRate = null,
}) {
    const sizes = {
        sm: "w-3.5 h-3.5",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    };

    const starSize = sizes[size] || sizes.md;

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    onClick={() => interactive && onRate && onRate(star)}
                    className={`${interactive
                            ? "cursor-pointer hover:scale-110 transition-transform"
                            : "cursor-default"
                        } focus:outline-none`}
                >
                    <svg
                        className={`${starSize} transition-colors duration-150 ${star <= rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-600 fill-slate-600"
                            }`}
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                </button>
            ))}
        </div>
    );
}