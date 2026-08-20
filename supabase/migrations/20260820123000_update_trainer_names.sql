UPDATE public.trainers
SET name = CASE code
  WHEN 'T1' THEN 'Vinay'
  WHEN 'T2' THEN 'Pavan'
  WHEN 'T3' THEN 'Rakesh'
  WHEN 'T4' THEN 'Kishore'
  WHEN 'T5' THEN 'Karthikeya'
END
WHERE code IN ('T1', 'T2', 'T3', 'T4', 'T5');