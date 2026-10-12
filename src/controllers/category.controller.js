
export const getCategories = (req, res) => {
  const categories = [
    { name: "Childhood", slug: "childhood" },
    { name: "School Days", slug: "school-days" },
    { name: "Friendship", slug: "friendship" },
    { name: "First Love", slug: "first-love" },
    { name: "Old Technology", slug: "old-technology" },
    { name: "Festivals", slug: "festivals" },
    { name: "Village Life", slug: "village-life" },
    { name: "Internet Era", slug: "internet-era" },
    { name: "36 July Memories", slug: "36-july-memories" },
    { name: "Other Memories", slug: "other-memories" }
  ];

  return res.status(200).json({
    message: "Categories fetched successfully",
    data: categories
  });
};