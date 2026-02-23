BEGIN;


CREATE TABLE IF NOT EXISTS public.users
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    first_name text,
    last_name text,
    email text,
    password_hash text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    user_level integer NOT NULL DEFAULT 1,
    profile_pic_url text,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.tasks
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    priority_list_id uuid,
    title text,
    content text,
    is_completed boolean,
    due_date timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.priority_lists
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id),
    UNIQUE (user_id)
);

ALTER TABLE IF EXISTS public.tasks
    ADD FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.tasks
    ADD FOREIGN KEY (priority_list_id)
    REFERENCES public.priority_lists (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.priority_lists
    ADD FOREIGN KEY (user_id)
    REFERENCES public.users (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

END;