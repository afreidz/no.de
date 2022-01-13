/**
 * Do not edit directly
 * Generated on Wed, 12 Jan 2022 22:08:16 GMT
 */

export default tokens;

declare interface DesignToken {
  value: any;
  name?: string;
  comment?: string;
  themeable?: boolean;
  attributes?: {
    category?: string;
    type?: string;
    item?: string;
    subitem?: string;
    state?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

declare const tokens: {
  "color": {
    "black": {
      "0": DesignToken,
      "1": DesignToken,
      "2": DesignToken,
      "3": DesignToken,
      "4": DesignToken
    },
    "highlights": {
      "rosewater": DesignToken,
      "flamingo": DesignToken,
      "mauve": DesignToken,
      "pink": DesignToken,
      "maroon": DesignToken,
      "red": DesignToken,
      "peach": DesignToken,
      "yellow": DesignToken,
      "green": DesignToken,
      "teal": DesignToken,
      "blue": DesignToken,
      "sky": DesignToken,
      "lavender": DesignToken
    },
    "gray": {
      "0": DesignToken,
      "1": DesignToken,
      "3": DesignToken
    },
    "white": {
      "0": DesignToken
    }
  }
}