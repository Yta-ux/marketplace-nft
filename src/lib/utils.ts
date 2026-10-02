import { createCn } from "cn/config"

export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "tiny",
            "micro",
            "caption",
            "caption-lg",
            "body-sm",
            "body",
            "body-lg",
            "label",
            "title-sm",
            "title",
            "heading",
            "heading-lg",
            "display",
          ],
        },
      ],
      rounded: [{ rounded: ["art", "feature", "hero"] }],
    },
  },
})
