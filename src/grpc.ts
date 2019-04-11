/*
 * Copyright (C) 2019  United Operations
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import grpc from 'grpc'
import { loadSync, PackageDefinition } from '@grpc/proto-loader'
import { join } from 'path'
import { Bot, UserRoleSets } from './bot'

type ServiceCall = {
  _events: Record<any, any>
  _eventsCount: number
  domain: string | null
  call: Record<any, any>
  cancelled: boolean
  metadata: {
    _internal_repr: {
      'user-agent': string[]
    }
  }
  request: any
}

/**
 * Initialize the gRPC server and configure the services
 * @export
 * @param {Bot} bot
 * @returns {grpc.Server}
 */
export function init(bot: Bot): grpc.Server {
  const definition: PackageDefinition = loadSync(join(__dirname, 'protos/provision.proto'))
  const descriptor: grpc.GrpcObject = grpc.loadPackageDefinition(definition)
  const server = new grpc.Server()

  // @ts-ignore: TypeScript doesn't recognize the nested services on a GrpcObject instance
  server.addService(descriptor.ProvisionService.service, {
    get: (call: ServiceCall, callback: any) => {
      const res: UserRoleSets = bot.getUserRoles(call.request.id)
      callback(null, res)
    },
    provision: async (call: ServiceCall, callback: any) => {
      const {
        id,
        assign,
        revoke
      }: { id: string; assign: string[]; revoke: string[] } = call.request
      const res: boolean = await bot.provisionUserRoles(id, assign, revoke)
      callback(null, { success: res })
    }
  })

  server.bind(`0.0.0.0:${process.env.GRPC_PORT!}`, grpc.ServerCredentials.createInsecure())
  return server
}
