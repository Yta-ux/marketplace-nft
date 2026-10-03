import iconAccountActivity from "@/assets/icons/account-activity.svg"
import iconAccountDanger from "@/assets/icons/account-danger.svg"
import iconAccountDownload from "@/assets/icons/account-download.svg"
import iconAccountHeart from "@/assets/icons/account-heart.svg"
import iconAccountLocation from "@/assets/icons/account-location.svg"
import iconAccountLocationActive from "@/assets/icons/account-location-active.svg"
import iconAccountLogout from "@/assets/icons/account-logout.svg"
import iconAccountShopping from "@/assets/icons/account-shopping.svg"
import iconAccountUser from "@/assets/icons/account-user.svg"
import iconAccountUserActive from "@/assets/icons/account-user-active.svg"
import arrowDown from "@/assets/icons/arrow-down.svg"
import arrowDownLg from "@/assets/icons/arrow-down-lg.svg"
import iconArrowDownXl from "@/assets/icons/arrow-down-xl.svg"
import iconArrowEns from "@/assets/icons/arrow-ens.svg"
import iconArrowLeft from "@/assets/icons/arrow-left.svg"
import iconArrowLeftMuted from "@/assets/icons/arrow-left-muted.svg"
import arrowRight from "@/assets/icons/arrow-right.svg"
import arrowRightSm from "@/assets/icons/arrow-right-sm.svg"
import iconAvatarImage from "@/assets/icons/avatar-image.svg"
import cart from "@/assets/icons/cart.svg"
import chevronRight from "@/assets/icons/chevron-right.svg"
import close from "@/assets/icons/close.svg"
import iconCloseModal from "@/assets/icons/close-modal.svg"
import deleteIcon from "@/assets/icons/delete.svg"
import iconDeletePrimary from "@/assets/icons/delete-primary.svg"
import iconEyeMobile from "@/assets/icons/eye-mobile.svg"
import iconEyeModal from "@/assets/icons/eye-modal.svg"
import iconEyeProfile from "@/assets/icons/eye-profile.svg"
import iconFacebook from "@/assets/icons/facebook.svg"
import favorite from "@/assets/icons/favorite.svg"
import favoriteLg from "@/assets/icons/favorite-lg.svg"
import filter from "@/assets/icons/filter.svg"
import iconGoogle from "@/assets/icons/google.svg"
import heartFilled from "@/assets/icons/heart-filled.svg"
import iconHeartMobile from "@/assets/icons/heart-mobile.svg"
import heartOutline from "@/assets/icons/heart-outline.svg"
import iconHeroDots from "@/assets/icons/hero-dots.svg"
import login from "@/assets/icons/login.svg"
import minus from "@/assets/icons/minus.svg"
import minusLg from "@/assets/icons/minus-lg.svg"
import iconMoreDots from "@/assets/icons/more-dots.svg"
import plus from "@/assets/icons/plus.svg"
import plusLg from "@/assets/icons/plus-lg.svg"
import iconRadioMuted from "@/assets/icons/radio-muted.svg"
import iconRadioSelected from "@/assets/icons/radio-selected.svg"
import scan from "@/assets/icons/scan.svg"
import search from "@/assets/icons/search.svg"
import searchField from "@/assets/icons/search-field.svg"
import shareLinkedin from "@/assets/icons/share-linkedin.svg"
import shareMessage from "@/assets/icons/share-message.svg"
import shareTwitter from "@/assets/icons/share-twitter.svg"
import iconShop from "@/assets/icons/shop.svg"
import facebook from "@/assets/icons/social-facebook.svg"
import instagram from "@/assets/icons/social-instagram.svg"
import linkedin from "@/assets/icons/social-linkedin.svg"
import twitter from "@/assets/icons/social-twitter.svg"
import youtube from "@/assets/icons/social-youtube.svg"
import star from "@/assets/icons/star.svg"
import iconStarAmber from "@/assets/icons/star-amber.svg"
import starEmpty from "@/assets/icons/star-empty.svg"
import iconStepperMinusCircle from "@/assets/icons/stepper-minus-circle.svg"
import iconStepperMinusCircleDisabled from "@/assets/icons/stepper-minus-circle-disabled.svg"
import thanks from "@/assets/icons/thanks.svg"
import iconWalletAvatar from "@/assets/icons/wallet-avatar.svg"
import iconWalletMobile from "@/assets/icons/wallet-mobile.svg"
import { cn } from "@/lib/utils"

type IconSpec = {
  src: string
  box: [number, number]
  size: [number, number]
  offset: [number, number]
  rotate?: number
}

const icons = {
  "account-user": { src: iconAccountUser, box: [18, 18], size: [18, 18], offset: [0, 0] },
  "account-user-active": {
    src: iconAccountUserActive,
    box: [18, 18],
    size: [18, 18],
    offset: [0, 0],
  },
  "account-location": {
    src: iconAccountLocation,
    box: [20, 20],
    size: [13.75, 16.25],
    offset: [3.33, 1.67],
  },
  "account-location-active": {
    src: iconAccountLocationActive,
    box: [20, 20],
    size: [13.75, 16.25],
    offset: [3.33, 1.67],
  },
  "account-shopping": { src: iconAccountShopping, box: [18, 18], size: [18, 18], offset: [0, 0] },
  "account-heart": { src: iconAccountHeart, box: [16, 16], size: [16, 16], offset: [0, 0] },
  "account-activity": {
    src: iconAccountActivity,
    box: [18, 18],
    size: [15.85, 15.9],
    offset: [1.09, 1.01],
  },
  "account-download": {
    src: iconAccountDownload,
    box: [18, 18],
    size: [15.38, 15.46],
    offset: [1.31, 1.31],
  },
  "account-danger": {
    src: iconAccountDanger,
    box: [18, 18],
    size: [15.75, 15],
    offset: [1.13, 1.5],
  },
  "account-logout": {
    src: iconAccountLogout,
    box: [20, 20],
    size: [17.78, 16.92],
    offset: [1.13, 1.54],
  },
  "eye-profile": { src: iconEyeProfile, box: [20, 20], size: [16.67, 14.39], offset: [1.67, 3.33] },
  "eye-modal": { src: iconEyeModal, box: [18.98, 14.64], size: [18.98, 14.64], offset: [0, 0] },
  "eye-mobile": { src: iconEyeMobile, box: [18, 18], size: [15.38, 13.33], offset: [1.31, 2.44] },
  "arrow-ens": { src: iconArrowEns, box: [20, 20], size: [20, 20], offset: [0, 0] },
  "arrow-down-xl": { src: iconArrowDownXl, box: [20, 20], size: [20, 20], offset: [0, 0] },
  "avatar-image": { src: iconAvatarImage, box: [24, 24], size: [20, 20], offset: [2, 2] },
  "close-modal": { src: iconCloseModal, box: [18, 18], size: [18, 18], offset: [0, 0] },
  "facebook-logo": { src: iconFacebook, box: [20, 20], size: [20, 20], offset: [0, 0] },
  "hero-dots": { src: iconHeroDots, box: [56, 7], size: [56, 7], offset: [0, 0] },
  "arrow-left": {
    src: iconArrowLeft,
    box: [20, 20],
    size: [13.17, 7.33],
    offset: [3.42, 6.33],
    rotate: 90,
  },
  "arrow-left-muted": {
    src: iconArrowLeftMuted,
    box: [20, 20],
    size: [13.17, 7.33],
    offset: [3.42, 6.33],
    rotate: 90,
  },
  "heart-mobile": { src: iconHeartMobile, box: [16, 14.23], size: [16, 14.23], offset: [0, 0] },
  "star-amber": { src: iconStarAmber, box: [14, 14], size: [11.67, 11.08], offset: [1.17, 1.46] },
  shop: { src: iconShop, box: [20, 20], size: [20, 20], offset: [0, 0] },
  "delete-primary": {
    src: iconDeletePrimary,
    box: [24, 24],
    size: [17.65, 19.98],
    offset: [3.46, 1.96],
  },
  "stepper-minus-circle": {
    src: iconStepperMinusCircle,
    box: [24, 24],
    size: [24, 24],
    offset: [0, 0],
  },
  "stepper-minus-circle-disabled": {
    src: iconStepperMinusCircleDisabled,
    box: [24, 24],
    size: [24, 24],
    offset: [0, 0],
  },
  "more-dots": { src: iconMoreDots, box: [3, 15], size: [3, 15], offset: [0, 0] },
  "radio-selected": { src: iconRadioSelected, box: [16, 16], size: [16, 16], offset: [0, 0] },
  "radio-muted": { src: iconRadioMuted, box: [16, 16], size: [16, 16], offset: [0, 0] },
  "wallet-avatar": { src: iconWalletAvatar, box: [40, 40], size: [40, 40], offset: [0, 0] },
  "wallet-mobile": {
    src: iconWalletMobile,
    box: [24, 24],
    size: [20.1, 18.58],
    offset: [1.94, 2.96],
  },
  google: { src: iconGoogle, box: [20, 20], size: [20, 20], offset: [0, 0] },
  "arrow-down-lg": { src: arrowDownLg, box: [18, 18], size: [18, 18], offset: [0, 0] },
  close: { src: close, box: [18, 17.35], size: [18, 17.35], offset: [0, 0] },
  delete: { src: deleteIcon, box: [24, 24], size: [17.65, 19.98], offset: [3.46, 1.96] },
  "favorite-lg": { src: favoriteLg, box: [30, 30], size: [30, 30], offset: [0, 0] },
  "heart-outline": { src: heartOutline, box: [20, 20], size: [20, 20], offset: [0, 0] },
  "heart-filled": { src: heartFilled, box: [16, 16], size: [16, 16], offset: [0, 0] },
  "heart-filled-md": { src: heartFilled, box: [18, 18], size: [18, 18], offset: [0, 0] },
  "heart-filled-lg": { src: heartFilled, box: [20, 20], size: [20, 20], offset: [0, 0] },
  "heart-filled-mobile": { src: heartFilled, box: [16, 16], size: [16, 16], offset: [0, 0] },
  minus: { src: minus, box: [16, 16], size: [16, 16], offset: [0, 0] },
  "minus-lg": { src: minusLg, box: [26.4, 26.4], size: [26.4, 26.4], offset: [0, 0] },
  plus: { src: plus, box: [16, 16], size: [16, 16], offset: [0, 0] },
  "plus-lg": { src: plusLg, box: [26.4, 26.4], size: [26.4, 26.4], offset: [0, 0] },
  "share-linkedin": { src: shareLinkedin, box: [15, 14.38], size: [15, 14.38], offset: [0, 0] },
  "share-message": { src: shareMessage, box: [18, 18], size: [18, 18], offset: [0, 0] },
  "share-twitter": { src: shareTwitter, box: [15.97, 12.19], size: [15.97, 12.19], offset: [0, 0] },
  star: { src: star, box: [15, 15], size: [12.5, 11.88], offset: [1.25, 1.56] },
  "star-empty": { src: starEmpty, box: [15, 15], size: [12.5, 11.88], offset: [1.25, 1.56] },
  thanks: { src: thanks, box: [80, 80], size: [65.16, 80], offset: [7.42, 0] },
  "cart-sm": { src: cart, box: [18, 18], size: [18, 18], offset: [0, 0] },
  "search-sm": { src: search, box: [18, 18], size: [18, 18], offset: [0, 0] },
  "heart-sm": { src: heartOutline, box: [18, 18], size: [18, 18], offset: [0, 0] },
  search: { src: search, box: [20, 20], size: [20, 20], offset: [0, 0] },
  "search-field": { src: searchField, box: [22, 22], size: [22, 22], offset: [0, 0] },
  filter: { src: filter, box: [22, 22], size: [16.15, 16.11], offset: [3.53, 3.53] },
  favorite: { src: favorite, box: [28, 28], size: [28, 28], offset: [0, 0] },
  scan: { src: scan, box: [26.82, 24], size: [26.82, 24], offset: [0, 0] },
  "arrow-right-sm": {
    src: arrowRightSm,
    box: [16, 16],
    size: [9.53, 11.5],
    offset: [3.4, 2.07],
    rotate: -90,
  },
  cart: { src: cart, box: [24, 24], size: [24, 24], offset: [0, 0] },
  login: { src: login, box: [20, 20], size: [17.78, 16.92], offset: [1.13, 1.54] },
  "arrow-down": { src: arrowDown, box: [16, 16], size: [10.83, 6.17], offset: [2.58, 4.92] },
  "arrow-right": {
    src: arrowRight,
    box: [18, 18],
    size: [10.54, 12.75],
    offset: [3.92, 2.42],
    rotate: -90,
  },
  "chevron-right": {
    src: chevronRight,
    box: [18, 18],
    size: [12, 6.75],
    offset: [3, 5.63],
    rotate: -90,
  },
  "chevron-left": {
    src: chevronRight,
    box: [18, 18],
    size: [12, 6.75],
    offset: [3, 5.63],
    rotate: 90,
  },
  facebook: { src: facebook, box: [30, 30], size: [32, 32], offset: [-1, -1] },
  instagram: { src: instagram, box: [30, 30], size: [32, 32], offset: [-1, -1] },
  twitter: { src: twitter, box: [30, 30], size: [32, 32], offset: [-1, -1] },
  linkedin: { src: linkedin, box: [30, 30], size: [32, 32], offset: [-1, -1] },
  youtube: { src: youtube, box: [30, 30], size: [32, 32], offset: [-1, -1] },
} satisfies Record<string, IconSpec>

export type IconName = keyof typeof icons

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const spec: IconSpec = icons[name]
  const [boxW, boxH] = spec.box
  const [w, h] = spec.size
  const [left, top] = spec.offset
  return (
    <span
      aria-hidden="true"
      className={cn("relative block shrink-0", className)}
      style={{ width: boxW, height: boxH }}
    >
      <img
        src={spec.src}
        alt=""
        width={w}
        height={h}
        className="absolute block max-w-none"
        style={{
          left,
          top,
          width: w,
          height: h,
          rotate: spec.rotate ? `${spec.rotate}deg` : undefined,
        }}
      />
    </span>
  )
}
