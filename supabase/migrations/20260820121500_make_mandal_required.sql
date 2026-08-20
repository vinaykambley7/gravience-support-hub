UPDATE public.grievances
SET mandal = ''
WHERE mandal IS NULL;

ALTER TABLE public.grievances
  ALTER COLUMN mandal SET NOT NULL;