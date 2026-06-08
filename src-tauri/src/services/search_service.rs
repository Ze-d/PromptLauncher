// search_service.rs — Search scoring and ranking
// TODO: Score prompts by title/tag/description/content match
//       Weight: title +50, tag +30, description +15, content +10
//       Bonus: favorite +10, recent use 0~+20, usage count 0~+20
//       Sort by score DESC, last_used_at DESC, updated_at DESC
