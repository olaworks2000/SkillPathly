/**
 * skillInference.ts — re-exports from dataService for backward compatibility.
 * New code should import directly from dataService.
 */
export {
  inferSkillsFromModules,
  inferSkillsFromProjects,
  mergeSkills,
} from './dataService'
