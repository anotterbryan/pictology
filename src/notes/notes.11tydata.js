// Drafts (published: false) get no page at all.
export default {
  layout: "layouts/post.njk",
  eleventyComputed: {
    permalink: (data) => (data.published === false ? false : "/notes/" + data.page.fileSlug + "/"),
  },
};
