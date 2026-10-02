import {
  type ChangePasswordRequest,
  type Profile,
  profileSchema,
  type UpdateProfileRequest,
} from "@/api/contracts"
import { http, parseResponse } from "@/api/http"

export const profileApi = {
  get: async (signal?: AbortSignal): Promise<Profile> =>
    parseResponse(profileSchema, (await http.get("/me", { signal })).data),

  update: async (body: UpdateProfileRequest): Promise<Profile> =>
    parseResponse(profileSchema, (await http.patch("/me", body)).data),

  uploadAvatar: async (file: File): Promise<Profile> => {
    const form = new FormData()
    form.append("file", file)
    return parseResponse(profileSchema, (await http.put("/me/avatar", form)).data)
  },

  removeAvatar: async (): Promise<Profile> =>
    parseResponse(profileSchema, (await http.delete("/me/avatar")).data),

  changePassword: async (body: ChangePasswordRequest): Promise<void> => {
    await http.put("/me/password", body)
  },
}
