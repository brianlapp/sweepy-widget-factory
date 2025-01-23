create or replace function deploy_widget_version(p_version_id uuid, p_bundle_hash text)
returns void
language plpgsql
security definer
as $$
begin
  -- First update the target version
  update widget_versions
  set bundle_hash = p_bundle_hash,
      deployed_at = current_timestamp,
      is_active = true
  where id = p_version_id;

  -- Then deactivate all other versions
  update widget_versions
  set is_active = false
  where id != p_version_id;

  -- Verify the update was successful
  if not exists (
    select 1 from widget_versions
    where id = p_version_id
    and bundle_hash = p_bundle_hash
    and is_active = true
  ) then
    raise exception 'Failed to update widget version status';
  end if;
end;
$$;