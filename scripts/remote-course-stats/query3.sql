with cur_data as (
    with cur_locations as (
        with cur_studyevents as (
            select id as cur_id,
            jsonb_array_elements(jsonb_array_elements(jsonb_array_elements(study_group_sets)->'studySubGroups')->'studyEventIds')->>0 as se_id
            from course_unit_realisations
        ),
        notices as (
            select id, jsonb_array_elements(overrides)->'notice'->>'en' notice
            from study_events
        )

        select 
            cur_id, 
            bool_or(
                (se.location_ids is not null) and (array_length(se.location_ids, 1) > 0)
            ) as has_locations,
            string_agg(notices.notice, ' ') as notices
        from cur_studyevents 
        left join study_events se on se.id = se_id
        left join notices on notices.id = se.id
        group by cur_id
    ), cur_organisations as (
        with cur_org as (
            select id, jsonb_array_elements(organisations)->>'organisationId' org_id
            from course_unit_realisations
        )
        select id, array_agg(org_id) organisations
        from cur_org
        group by id
    )

    select 
        cur.id,
        to_date(activity_period->>'startDate', 'YYYY-MM-DD') as "start_date",
        case when notices is null then '' else notices end,
        case when has_locations is null then false else has_locations end,
        substring(cur.course_unit_realisation_type_urn, 39) as "type",
        cuo.organisations && ARRAY['hy-org-48902017', 'hy-org-48645785', 'hy-org-48901712'] as open_uni
    from
        cur_locations
    right join course_unit_realisations cur on cur.id = cur_id
    left join cur_organisations cuo on cuo.id = cur_id
    where cur.flow_state != 'CANCELLED' AND cur.flow_state != 'ARCHIVED'
)

select * from
cur_data
where start_date > DATE('2020-01-01')
AND start_date < DATE('2023-01-01')
Joku ￼ ￼  koodannu paskaa siellä