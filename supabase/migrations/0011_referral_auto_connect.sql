-- redeem_referral() insertaba la conexión en 'pending', igual que un pedido
-- por username — pero acá ese paso extra no tiene sentido: quien llega ya
-- pasó por dos gestos explícitos (quien invita compartió el link, quien
-- entra tocó "Conectar" en ReferralWelcome). Pedirle a quien invita un
-- tercer "aceptar" es fricción redundante, y la copy de ReferralWelcome ya
-- promete conexión inmediata ("van a poder ver... y aparecer juntos en el
-- ranking" — nunca dice "se manda una solicitud"). Connections nacidas por
-- referido pasan a 'accepted' directo; agregar por username sigue pidiendo
-- accept explícito, ahí sí hace falta: el que recibe el pedido nunca dio
-- ningún gesto previo de consentimiento.
create or replace function public.redeem_referral(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inviter uuid;
begin
  if auth.uid() is null then
    raise exception 'Hace falta estar autenticado';
  end if;

  select id into inviter from public.profiles where referral_code = p_code;

  if inviter is null or inviter = auth.uid() then
    return null;
  end if;

  update public.profiles
     set referred_by = inviter
   where id = auth.uid() and referred_by is null;

  -- on conflict actualiza en vez de no hacer nada: si esta persona ya tenía
  -- una conexión 'pending' de antes de este fix (por ejemplo, reabrió un
  -- link viejo), redimir el código de nuevo la deja resuelta sin que nadie
  -- tenga que ir a aceptarla a mano.
  insert into public.connections (user_id, friend_id, status)
  values (auth.uid(), inviter, 'accepted')
  on conflict (user_id, friend_id) do update set status = 'accepted';

  return inviter;
end;
$$;
