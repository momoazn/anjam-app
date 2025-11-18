# Status System Migration Plan

## Current State

The application has **dual status tracking** which creates technical debt:

1. **Legacy System** (`status` field):

   - Type: Select field with hardcoded values
   - Values: `todo`, `in_progress`, `pending`, `done`, `canceled`, `blocked`, `review`, `testing`, `ready`, `on_hold`
   - Location: `tasks` collection in pb_schema.json (line 1401)
   - Not required, can be null

2. **New System** (`status_config` field):
   - Type: Relation to `status_configs` collection
   - Allows per-project customizable statuses
   - Location: `tasks` collection in pb_schema.json (line 1426)
   - Provides flexibility for different project workflows

## Problems with Current Approach

1. **Confusion**: Two fields tracking the same conceptual data
2. **Inconsistency**: Tasks may have status set in legacy field, status_config field, both, or neither
3. **Maintenance burden**: Code must handle both systems
4. **User experience**: Unclear which status system is "active"

## Migration Strategy

### Option A: Full Migration to `status_config` (Recommended)

**Pros:**

- Flexible, per-project customization
- Better UX for different workflow needs
- Modern, scalable approach

**Cons:**

- Requires data migration for existing tasks
- More complex to implement
- Need to ensure all projects have default status configs

**Steps:**

1. Create default status configs for all existing projects
2. Migrate existing task status values to status_config relations
3. Update all code to use status_config exclusively
4. Remove legacy status field from schema
5. Update type definitions

### Option B: Stick with Legacy `status` Field

**Pros:**

- Simpler, already working
- No data migration needed
- Less code changes

**Cons:**

- Loses flexibility
- Wastes existing status_configs infrastructure
- Less scalable

### Option C: Hybrid Approach (Current State - Not Recommended)

This is what we currently have and should be avoided.

## Recommended Path: Option A

### Phase 1: Preparation

- [x] Audit current status_config usage
- [ ] Create migration script for existing data
- [ ] Add tests for migration logic

### Phase 2: Data Migration

- [ ] Ensure all projects have default status configs
- [ ] Map legacy status values to status_config IDs
- [ ] Migrate all task.status → task.status_config
- [ ] Verify data integrity

### Phase 3: Code Migration

- [ ] Update hooks to use status_config
- [ ] Update components to use status_config
- [ ] Update filters to use status_config
- [ ] Remove status field references

### Phase 4: Schema Cleanup

- [ ] Make status_config required
- [ ] Remove legacy status field
- [ ] Regenerate types with `bun run gen:type`

### Phase 5: Testing

- [ ] Test all task operations
- [ ] Test status filtering
- [ ] Test project-specific status configs
- [ ] E2E testing of status workflows

## Implementation Details

### Default Status Mapping

Legacy status → Status Config:

```
todo       → TODO (key: todo, color: gray, icon: circle)
in_progress→ IN_PROGRESS (key: in_progress, color: blue, icon: progress)
pending    → PENDING (key: pending, color: yellow, icon: clock)
done       → DONE (key: done, color: green, icon: check, is_completed: true)
canceled   → CANCELED (key: canceled, color: red, icon: x, is_canceled: true)
blocked    → BLOCKED (key: blocked, color: orange, icon: alert)
review     → REVIEW (key: review, color: purple, icon: eye)
testing    → TESTING (key: testing, color: indigo, icon: test)
ready      → READY (key: ready, color: teal, icon: rocket)
on_hold    → ON_HOLD (key: on_hold, color: gray, icon: pause)
```

### Migration Script Pseudocode

```typescript
async function migrateTaskStatuses() {
  // 1. Get all projects
  const projects = await pb.collection("projects").getFullList();

  // 2. For each project, ensure default status configs exist
  for (const project of projects) {
    await createDefaultStatusConfigs(project.id);
  }

  // 3. Get all tasks with legacy status set
  const tasks = await pb.collection("tasks").getFullList({
    filter: "status != null && status_config = null",
  });

  // 4. Map each task's status to appropriate status_config
  for (const task of tasks) {
    const statusConfig = await findStatusConfigByKey(task.project, task.status);

    if (statusConfig) {
      await pb.collection("tasks").update(task.id, {
        status_config: statusConfig.id,
        status: null, // Clear legacy field
      });
    }
  }
}
```

## Risks & Mitigation

### Risk 1: Data Loss During Migration

**Mitigation**: Backup database before migration, test on copy first

### Risk 2: Downtime Required

**Mitigation**: Migration can run in background, app handles both fields during transition

### Risk 3: Missing Status Configs

**Mitigation**: Create defaults for all projects before starting migration

### Risk 4: Breaking Changes

**Mitigation**: Gradual rollout, feature flags, comprehensive testing

## Timeline Estimate

- **Preparation**: 2-4 hours
- **Migration Script**: 4-6 hours
- **Code Updates**: 8-12 hours
- **Testing**: 4-6 hours
- **Total**: 18-28 hours

## Decision

**Recommendation**: Proceed with Option A (Full migration to status_config)

This provides the most value long-term and aligns with the existing status_configs infrastructure already built into the application.

## Next Steps

1. Create migration script in `scripts/migrate-status.ts`
2. Add rollback capability
3. Test migration on development data
4. Update all components and hooks
5. Remove legacy field from schema
6. Update documentation

---

**Status**: Planning Phase
**Last Updated**: 2025-11-18
